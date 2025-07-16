# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

model = joblib.load('diabetes_model_universal.joblib')

MODEL_FEATURES = [
    'age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level',
    'blood_glucose_level', 'gender_Male'
]

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()

    # --- Perhitungan BMI Dimulai ---
    try:
        height_cm = float(data['height'])
        weight_kg = float(data['weight'])
        if height_cm > 0:
            height_m = height_cm / 100
            bmi = weight_kg / (height_m ** 2)
        else:
            bmi = 0
        data['bmi'] = bmi # Tambahkan bmi ke data
    except (ValueError, KeyError):
        return jsonify({'error': 'Input tinggi dan berat tidak valid'}), 400
    # --- Perhitungan BMI Selesai ---

    try:
        input_df = pd.DataFrame([data])

        # Konversi tipe data
        for col in ['age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level', 'blood_glucose_level']:
             if col in input_df.columns:
                input_df[col] = pd.to_numeric(input_df[col])

        # One-Hot Encoding
        input_df = pd.get_dummies(input_df)

        # Sesuaikan kolom agar cocok dengan model
        for col in MODEL_FEATURES:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[MODEL_FEATURES]
        
        # Prediksi
        prediction = model.predict(input_df)
        proba = model.predict_proba(input_df)

        output = int(prediction[0])
        probability = proba[0]

        return jsonify({
            'prediction': 'Positif Diabetes' if output == 1 else 'Negatif Diabetes',
            'probability': {
                'negatif': float(probability[0]),
                'positif': float(probability[1])
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)