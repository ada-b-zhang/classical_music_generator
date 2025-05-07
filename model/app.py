from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from tensorflow.keras.models import load_model
import uvicorn
import tensorflow as tf
from utils import get_predictions
from google.cloud import storage
from google.auth.credentials import AnonymousCredentials

storage_client = storage.Client(project="corgi-news")
bucket = storage_client.bucket("music_gen_all_midi")
blob = bucket.blob("model_weights/ada_needs_boba.keras")
blob.download_to_filename("ada_needs_boba.keras")

# Initialize FastAPI app
app = FastAPI(title="Prediction API", description="API for making predictions", version="1.0.0")

def helper_function(x):
    return tf.reduce_sum(x, axis=1)

# Create a request model
class PredictionRequest(BaseModel):
    inputs: List[float]
    parameters: Optional[Dict[str, Any]] = None

# Create a response model
class PredictionResponse(BaseModel):
    file_path: str

# Mock prediction function (replace with your actual model)
async def make_prediction(inputs, parameters=None):
    # This is where you would call your actual model
    
    model = load_model('music_generation_model.keras', safe_mode=False, custom_objects={'helper_function': helper_function,'tf':tf})
    model = load_model()
    file_path = get_predictions(model)
    
    return {
        "file_path": file_path,
    }

# Define the prediction route
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        result = await make_prediction(request.inputs, request.parameters)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Prediction API! Use the /predict endpoint to make predictions."}

# Run the server if this file is executed directly
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)