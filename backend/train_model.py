# backend/train_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# --- 1. Memuat Dataset ---
# Path disesuaikan dengan struktur folder Anda
dataset_path = os.path.join('.', 'dataset', 'diabetes_prediction_dataset.csv')
print(f"Memuat dataset dari: {dataset_path}")
data = pd.read_csv(dataset_path)

print(f"Jumlah baris data awal: {len(data)}")

# --- 2. Langkah Data Cleaning ---

# 1. Hapus Data Duplikat
data.drop_duplicates(inplace=True)
print(f"Jumlah baris setelah menghapus duplikat: {len(data)}")
# 2. Hapus data dengan gender 'Other'
data = data[data['gender'] != 'Other']
print(f"Jumlah baris setelah menghapus gender 'Other': {len(data)}")
# 3. Hapus data dengan usia di bawah 2 tahun (data desimal)
data = data[data['age'] >= 2].copy()
print(f"Jumlah baris setelah menghapus data usia < 2 tahun: {len(data)}")
# 4. Menghapus kolom smoking_history karena datanya tidak jelas dan importance-nya rendah
print("Menghapus kolom 'smoking_history'...")
data = data.drop(columns=['smoking_history'])

# Melakukan one-hot encoding untuk data kategorikal (gender)
# drop_first=True akan mengubah 'gender' menjadi satu kolom 'gender_Male' atau 'gender_Other'
print("Melakukan one-hot encoding...")
data = pd.get_dummies(data, drop_first=True)

print("\n" + "="*30)
print("Nilai Median untuk Setiap Kolom Fitur:")
fitur_untuk_median = data.drop('diabetes', axis=1)
nilai_median = fitur_untuk_median.median()
print(nilai_median)
print("="*30 + "\n")

# --- 3. Memisahkan Fitur (X) dan Target (y) ---
# Asumsi nama kolom target adalah 'diabetes'
X = data.drop('diabetes', axis=1)
y = data['diabetes']

# --- PENTING: Cetak nama kolom untuk digunakan di backend ---
print("\nFitur yang digunakan oleh model:")
model_features = X.columns.tolist()
print(model_features)

# --- 4. Membagi Data ---
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# --- 5. Melatih Model ---
print("\nMelatih model Random Forest...")
# Kita gunakan parameter sederhana karena hasilnya sudah sangat baik
model = RandomForestClassifier(n_estimators=300, random_state=42, class_weight='balanced')
model.fit(X_train, y_train)
print("Model berhasil dilatih.")

# -- 6. Cek Feature Importance ---
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

# --- 6. Mengevaluasi Model ---
print("\nMengevaluasi model pada data uji...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Akurasi Model: {accuracy * 100:.2f}%")

print("\nMengevaluasi model pada data latih...")
y_train_pred = model.predict(X_train)
train_accuracy = accuracy_score(y_train, y_train_pred)
print(f"Akurasi pada Data Latih: {train_accuracy * 100:.2f}%")

print("\nLaporan Klasifikasi:")
print(classification_report(y_test, y_pred))

# # --- Membuat dan Menyimpan Confusion Matrix ---
# print("\nMembuat Confusion Matrix...")
# cm = confusion_matrix(y_test, y_pred)
# plt.figure(figsize=(8, 6))
# sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
#             xticklabels=['Negatif', 'Positif'], 
#             yticklabels=['Negatif', 'Positif'])
# plt.xlabel('Prediksi Model')
# plt.ylabel('Kenyataan (Aktual)')
# plt.title('Confusion Matrix')
# # Simpan gambar
# plt.savefig('confusion_matrix.png')
# print("Gambar confusion_matrix.png telah disimpan.")
# plt.close() # Menutup plot agar tidak ditampilkan jika skrip dijalankan di lingkungan non-interaktif

# --- 7. Menyimpan Model ---
# Simpan model di folder utama backend
model_filename = 'diabetes_model_universal.joblib'
joblib.dump(model, model_filename)
print(f"\nModel baru telah disimpan sebagai '{model_filename}'")