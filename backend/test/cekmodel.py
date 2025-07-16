import joblib as joblib


model = joblib.load('diabetes_model_universal.joblib')
print(model)
print(model.get_params())
