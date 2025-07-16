

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

dataset_path = os.path.join('..', 'dataset', 'diabetes.csv')
print(f"Memuat dataset dari: {dataset_path}")
data = pd.read_csv(dataset_path)

print(f"Jumlah baris data awal: {len(data)}")

data.drop_duplicates(inplace=True)
print(f"Jumlah baris setelah menghapus duplikat: {len(data)}")

# print("Melakukan one-hot encoding...")
# data = pd.get_dummies(data, drop_first=True) 

# print("Menghapus kolom yang tidak diperlukan...")
# data = data.drop(columns=['CholCheck'])
# data = data.drop(columns=['AnyHealthcare'])
# data = data.drop(columns=['HvyAlcoholConsump'])
# data = data.drop(columns=['Education'])
# data = data.drop(columns=['MentHlth'])
# data = data.drop(columns=['DiffWalk'])
# data = data.drop(columns=['HeartDiseaseorAttack'])
# data = data.drop(columns=['NoDocbcCost'])

X = data.drop('Outcome', axis=1)
y = data['Outcome']

print("\nFitur yang digunakan oleh model:")
model_features = X.columns.tolist()
print(model_features)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("\nMelatih model Random Forest...")

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# --- BAGIAN BARU: Cek Feature Importance ---
print("\n" + "="*30)
print("Peringkat Pentingnya Fitur (Feature Importance):")
importances = model.feature_importances_
feature_names = X_train.columns

# Buat DataFrame untuk visualisasi yang lebih baik
feature_importance_df = pd.DataFrame({'feature': feature_names, 'importance': importances})
# Urutkan dari yang paling penting
feature_importance_df = feature_importance_df.sort_values('importance', ascending=False)

print(feature_importance_df)
print("="*30 + "\n")
# --- AKHIR BAGIAN BARU ---

print("Model berhasil dilatih.")

print("\nMengevaluasi model...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Akurasi Model: {accuracy * 100:.2f}%")

print("\nMengevaluasi model pada data latih...")
y_train_pred = model.predict(X_train)
train_accuracy = accuracy_score(y_train, y_train_pred)
print(f"Akurasi pada Data Latih: {train_accuracy * 100:.2f}%")

print("\nLaporan Klasifikasi:")
print(classification_report(y_test, y_pred))

# Menyimpan model ke file
model_filename = 'diabetes_model_pima.joblib'
joblib.dump(model, model_filename)
print(f"\nModel baru telah disimpan sebagai '{model_filename}'")