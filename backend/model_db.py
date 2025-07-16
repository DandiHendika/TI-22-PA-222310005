# backend/models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Inisialisasi objek db di sini
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    predictions = db.relationship('Prediction', backref='user', lazy=True, cascade="all, delete-orphan")

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    age = db.Column(db.Float, nullable=False)
    hypertension = db.Column(db.Integer, nullable=False)
    heart_disease = db.Column(db.Integer, nullable=False)
    bmi = db.Column(db.Float, nullable=False)
    HbA1c_level = db.Column(db.Float, nullable=False)
    blood_glucose_level = db.Column(db.Float, nullable=False)
    gender_Male = db.Column(db.Integer, nullable=False)
    result_prediction = db.Column(db.String(50), nullable=False)
    result_probability = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)