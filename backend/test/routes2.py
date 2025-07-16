# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# ... (Konfigurasi app.config tetap sama) ...
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/db_prediksi_diabetes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'ganti-dengan-kunci-rahasia-anda'

# ... (Inisialisasi db, bcrypt, jwt dan model_db tetap sama) ...
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
from backend.model_db import User, Prediction # Pastikan import setelah db diinisialisasi jika model_db menggunakan db

# --- Memuat Model Machine Learning dengan penanganan error ---
MODEL_FEATURES = [
    'age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level',
    'blood_glucose_level', 'gender_Male'
]
model = None
try:
    print("Mencoba memuat model 'diabetes_model_universal.joblib'...")
    model = joblib.load('diabetes_model_universal.joblib')
    print("Model berhasil dimuat.")
except Exception as e:
    print(f"!!! GAGAL MEMUAT MODEL: {e} !!!")


# --- Rute Autentikasi (Tidak Diubah) ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    # ... kode register Anda ...
    data = request.get_json()
    user_exists = User.query.filter_by(email=data.get('email')).first()
    if user_exists: return jsonify({'error': 'Email sudah terdaftar'}), 409
    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(name=data.get('name'), email=data.get('email'), password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User berhasil dibuat'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    # ... kode login Anda ...
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    return jsonify({'error': 'Email atau password salah'}), 401

# --- Rute Prediksi dengan Debugging ---
@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict():
    print("\n--- Memulai proses di /api/predict ---")
    
    if model is None: 
        print("Error di Step 1: Model tidak termuat.")
        return jsonify({'error': 'Model tidak tersedia'}), 500
    print("Step 1: Model tersedia.")

    current_user_id = get_jwt_identity()
    print(f"Step 2: User ID '{current_user_id}' didapatkan.")

    data = request.get_json()
    print(f"Step 3: Menerima data JSON: {data}")

    try:
        height_cm = float(data['height'])
        weight_kg = float(data['weight'])
        data['bmi'] = (weight_kg / ((height_cm / 100) ** 2)) if height_cm > 0 else 0
        print(f"Step 4: BMI dihitung: {data['bmi']}")
    except Exception as e:
        print(f"!!! CRASH di Step 4 (Kalkulasi BMI): {e} !!!")
        return jsonify({'error': 'Input tinggi dan berat tidak valid'}), 400

    try:
        input_df = pd.DataFrame([data])
        print("Step 5: DataFrame awal dibuat.")

        input_df = pd.get_dummies(input_df, drop_first=True)
        print("Step 6: One-Hot Encoding selesai.")

        final_df = input_df.reindex(columns=MODEL_FEATURES, fill_value=0)
        print("Step 7: Reindex kolom selesai. DataFrame siap untuk model.")

        print("--- DataFrame Final yang Masuk ke Model ---")
        print(final_df.to_string())
        print("-------------------------------------------")
        
        prediction_val = model.predict(final_df)
        print("Step 8: `model.predict()` berhasil.")
        
        proba_val = model.predict_proba(final_df)
        print("Step 9: `model.predict_proba()` berhasil.")
        
        prediction_text = 'Positif Diabetes' if int(prediction_val[0]) == 1 else 'Negatif Diabetes'
        probability_positive = float(proba_val[0][1])
        print("Step 10: Hasil prediksi dan probabilitas diproses.")

        new_prediction = Prediction(
            age=final_df['age'].iloc[0], hypertension=final_df['hypertension'].iloc[0],
            heart_disease=final_df['heart_disease'].iloc[0], bmi=final_df['bmi'].iloc[0],
            HbA1c_level=final_df['HbA1c_level'].iloc[0], blood_glucose_level=final_df['blood_glucose_level'].iloc[0],
            gender_Male=final_df['gender_Male'].iloc[0],
            result_prediction=prediction_text, result_probability=probability_positive,
            user_id=int(current_user_id) # Pastikan user_id adalah integer
        )
        print("Step 11: Objek prediksi baru dibuat.")

        db.session.add(new_prediction)
        print("Step 12: `db.session.add()` berhasil.")

        db.session.commit()
        print("Step 13: `db.session.commit()` berhasil. Menyimpan ke database sukses.")

        return jsonify({
            'prediction': prediction_text,
            'probability': { 'negatif': float(proba_val[0][0]), 'positif': probability_positive }
        })
    except Exception as e:
        print(f"!!! CRASH di dalam blok Try-Except utama: {e} !!!")
        import traceback
        traceback.print_exc() # Cetak traceback lengkap
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=False)