# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,JWTManager
import joblib
import pandas as pd
from datetime import timedelta
from model_db import db, User, Prediction

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/db_prediksi_diabetes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'ini-secret-key-punya-gweh-cihuy'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Menghubungkan objek db dari model_db.py dengan aplikasi Flask
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

try:
    model = joblib.load('diabetes_model_universal.joblib')
    MODEL_FEATURES = [
        'age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level',
        'blood_glucose_level', 'gender_Male'
    ]
except FileNotFoundError:
    print("Model tidak ditemukan!, jika belum ada joblib pastikan run train_model.py terlebih dahulu.")
    model = None

#region register
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    user_exists = User.query.filter_by(email=data.get('email')).first()
    if user_exists:
        return jsonify({'error': 'Email sudah terdaftar'}), 409
    
    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(
        name=data.get('name'), 
        email=data.get('email'), 
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Registrasi berhasil!'}), 201
#endregion

#region login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    return jsonify({'error': 'Email atau password salah'}), 401
#endregion

#region prediksi
@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict():
    if model is None: 
        return jsonify({'error': 'Model tidak tersedia'}), 500
    
    # Dapatkan ID user yang sedang login dari token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    gender_str = data.get('gender', '').lower()
    if gender_str == 'male':
        data['gender_Male'] = 1
    else:
        data['gender_Male'] = 0

    if not data.get('blood_glucose_level'):
        data['blood_glucose_level'] = 140
    
    # Perhitungan BMI
    try:
        height_cm = float(data['height'])
        weight_kg = float(data['weight'])
        data['bmi'] = (weight_kg / ((height_cm / 100) ** 2)) if height_cm > 0 else 0
    except (ValueError, KeyError):
        return jsonify({'error': 'Input tinggi dan berat tidak valid'}), 400
   
    try:
        # Persiapan data untuk model
        input_df = pd.DataFrame([data])
        
        cols_to_convert = ['age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level', 'blood_glucose_level']
        for col in cols_to_convert:
            if col in input_df.columns:
                input_df[col] = pd.to_numeric(input_df[col])
    
        # input_df = pd.get_dummies(input_df, drop_first=True)
        
        final_df = input_df.reindex(columns=MODEL_FEATURES, fill_value=0)
        
        # Prediksi
        prediction_val = model.predict(final_df)[0]
        proba_val = model.predict_proba(final_df)[0]
        
        prediction_text = 'Positif Diabetes' if int(prediction_val) == 1 else 'Negatif Diabetes'
        # probability_positive = float(proba_val[1])
        if prediction_text == 'Positif Diabetes':
            probability_to_save = float(proba_val[1]) # Probabilitas positif
        else:
            probability_to_save = float(proba_val[0]) # Probabilitas negatif
        # --- Simpan riwayat ke database ---
        new_prediction = Prediction(
            age=final_df['age'].iloc[0], 
            hypertension=final_df['hypertension'].iloc[0],
            heart_disease=final_df['heart_disease'].iloc[0], 
            bmi=final_df['bmi'].iloc[0],
            HbA1c_level=final_df['HbA1c_level'].iloc[0], 
            blood_glucose_level=final_df['blood_glucose_level'].iloc[0],
            gender_Male=final_df['gender_Male'].iloc[0],
            result_prediction=prediction_text, 
            result_probability=probability_to_save,
            user_id=current_user_id
        )
        db.session.add(new_prediction)
        db.session.commit()

        # Kembalikan hasil ke frontend
        return jsonify({
            'prediction': prediction_text,
            'probability': { 'negatif': float(proba_val[0]), 'positif': float(proba_val[1]) },
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
#endregion

#region ngambil riwayat prediksi
@app.route('/api/history', methods=['GET'])
@jwt_required()
def history():
    current_user_id = get_jwt_identity()
    
    # Ambil semua prediksi milik user, urutkan dari yang terbaru
    user_predictions = Prediction.query.filter_by(user_id=current_user_id).order_by(Prediction.created_at.desc()).all()
    
    # Ubah objek menjadi format JSON yang bisa dikirim
    history_list = []
    for pred in user_predictions:
        history_list.append({
            'id': pred.id,
            'age': pred.age,
            'bmi': pred.bmi,
            'hypertension': pred.hypertension,
            'heart_disease': pred.heart_disease,
            'gender': 'Laki - Laki' if pred.gender_Male else 'Perempuan',
            'HbA1c_level': pred.HbA1c_level,
            'blood_glucose_level': pred.blood_glucose_level,
            'result_prediction': pred.result_prediction,
            'result_probability': pred.result_probability,
            'created_at': pred.created_at.strftime('%d %B %Y, %H:%M')
        })
        
    return jsonify(history_list)
#endregion

#region ngambil profile
@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id) # .get() adalah cara cepat mencari berdasarkan primary key
    
    if not user:
        return jsonify({"error": "User tidak ditemukan"}), 404
        
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email
    })
#endregion

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(port=5000, debug=True)