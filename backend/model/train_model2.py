# # backend/train_model.py (dengan SMOTE)

# import pandas as pd
# from sklearn.model_selection import train_test_split
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.metrics import classification_report, accuracy_score
# import joblib

# # Import SMOTE dari imbalanced-learn

# # --- 1. Memuat dan Membersihkan Dataset ---
# print("Memuat dan membersihkan data...")
# data = pd.read_csv('dataset/diabetes_prediction_dataset.csv')

# # Menghapus baris yang tidak diinginkan
# data = data[data['gender'] != 'Other']
# data.drop_duplicates(inplace=True)
# data = data[data['age'] >= 2].copy()

# # Menghapus kolom 'smoking_history'
# data = data.drop(columns=['smoking_history'])

# # One-Hot Encoding
# data = pd.get_dummies(data, drop_first=True)


# # --- 2. Memisahkan Fitur (X) dan Target (y) ---
# X = data.drop('diabetes', axis=1)
# y = data['diabetes']


# # --- 3. Membagi Data menjadi Latih dan Uji ---
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, test_size=0.2, random_state=42, stratify=y
# )


# # --- 4. Terapkan SMOTE HANYA pada Data Latih ---
# print("\nBentuk data latih asli:", X_train.shape)
# print("Distribusi kelas latih asli:\n", y_train.value_counts())

# smote = SMOTE(random_state=42)
# X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

# print("\nBentuk data latih setelah SMOTE:", X_train_resampled.shape)
# print("Distribusi kelas latih setelah SMOTE:\n", y_train_resampled.value_counts())
# # --- Akhir dari SMOTE ---


# # --- 5. Melatih Model dengan Data yang Sudah Diseimbangkan ---
# print("\nMelatih model Random Forest...")
# model = RandomForestClassifier(n_estimators=100, random_state=42)
# # Gunakan data _resampled untuk melatih
# model.fit(X_train_resampled, y_train_resampled)
# print("Model berhasil dilatih.")


# # --- 6. Mengevaluasi Model pada Data Uji Asli ---
# print("\nMengevaluasi model...")
# # Evaluasi tetap dilakukan pada X_test dan y_test yang asli
# y_pred = model.predict(X_test)
# accuracy = accuracy_score(y_test, y_pred)
# print(f"Akurasi Model: {accuracy * 100:.2f}%")
# print("\nLaporan Klasifikasi:")
# print(classification_report(y_test, y_pred))


# # --- 7. Menyimpan Model ---
# model_filename = 'diabetes_model_universal2.joblib'
# joblib.dump(model, model_filename)
# print(f"\nModel baru telah disimpan sebagai '{model_filename}'")