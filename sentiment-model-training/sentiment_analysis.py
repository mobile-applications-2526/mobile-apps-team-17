from fastapi import FastAPI
from pydantic import BaseModel
import joblib

# Load the trained model pipeline
model = joblib.load('sentiment_model.pkl')

# Get the class labels from the model
class_names = model.classes_

app = FastAPI()

# Define the input text structure
class TextInput(BaseModel):
    text: str

@app.post("/predict")
def predict_sentiment(data: TextInput):
    # The model expects a list of texts
    input_text = [data.text]

    # Make prediction
    prediction = model.predict(input_text)

    # Get probabilities for all classes
    probabilities = model.predict_proba(input_text)

    # Map probabilities to class names
    prob_dict = dict(zip(class_names, probabilities[0]))

    return {
        "prediction": prediction[0],
        "probabilities": prob_dict
    }