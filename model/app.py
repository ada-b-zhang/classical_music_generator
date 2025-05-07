# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List, Dict, Any, Optional
# from tensorflow.keras.models import load_model
# import uvicorn
# import tensorflow as tf
# from utils import get_predictions
# from google.cloud import storage
# from google.auth.credentials import AnonymousCredentials

# storage_client = storage.Client(project="corgi-news")
# bucket = storage_client.bucket("music_gen_all_midi")
# blob = bucket.blob("model_weights/ada_needs_boba.keras")
# blob.download_to_filename("ada_needs_boba.keras")

# # Initialize FastAPI app
# app = FastAPI(title="Prediction API", description="API for making predictions", version="1.0.0")

# def helper_function(x):
#     return tf.reduce_sum(x, axis=1)

# # Create a request model
# class PredictionRequest(BaseModel):
#     inputs: List[float]
#     parameters: Optional[Dict[str, Any]] = None

# # Create a response model
# class PredictionResponse(BaseModel):
#     file_path: str

# # Mock prediction function (replace with your actual model)
# async def make_prediction(inputs, parameters=None):
#     # This is where you would call your actual model
    
#     model = load_model('ada_needs_boba.keras', safe_mode=False, custom_objects={'helper_function': helper_function,'tf':tf})
#     print(model.summary())
#     file_path = get_predictions(model)
    
#     return {
#         "file_path": file_path,
#     }

# # Define the prediction route
# @app.post("/predict", response_model=PredictionResponse)
# async def predict(request: PredictionRequest):
#     try:
#         result = await make_prediction(request.inputs, request.parameters)
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# # Root endpoint
# @app.get("/")
# async def root():
#     return {"message": "Welcome to the Prediction API! Use the /predict endpoint to make predictions."}

# # Run the server if this file is executed directly
# if __name__ == "__main__":
#     uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import custom_object_scope
import uvicorn
from utils import get_predictions
from google.cloud import storage
from google.auth.credentials import AnonymousCredentials
import os

# Print versions for debugging
print(f"TensorFlow version: {tf.__version__}")
try:
    import keras
    print(f"Keras version: {keras.__version__}")
except ImportError:
    print("Using TensorFlow's built-in Keras")

# Initialize FastAPI app
app = FastAPI(title="Prediction API", description="API for making predictions", version="1.0.0")

def helper_function(x):
    return tf.reduce_sum(x, axis=1)

# Check if model exists locally before downloading
model_path = "music_generation_model.keras"
if not os.path.exists(model_path):
    try:
        print(f"Downloading model from GCS...")
        storage_client = storage.Client(credentials = AnonymousCredentials(),project="corgi-news")
        bucket = storage_client.bucket("music_gen_all_midi")
        blob = bucket.blob("model_weights/ada_needs_boba.keras")
        blob.download_to_filename(model_path)
        print(f"Model downloaded successfully")
    except Exception as e:
        print(f"Error downloading model: {e}")
        raise

# Create request and response models
class PredictionRequest(BaseModel):
    inputs: List[float]
    parameters: Optional[Dict[str, Any]] = None

class PredictionResponse(BaseModel):
    file_path: str

# Load model once at startup
try:
    print("Loading model...")
    with custom_object_scope({'helper_function': helper_function, 'tf': tf}):
        model = load_model(model_path, safe_mode=False)
    print("Model loaded successfully")
    print(model.summary())
except Exception as e:
    print(f"Error loading model: {e}")
    # Continue without failing - will try again during prediction

# Prediction function
async def make_prediction(inputs, parameters=None):
    # Load model here if not loaded at startup
    if 'model' not in globals() or model is None:
        print("Loading model during prediction call...")
        with custom_object_scope({'helper_function': helper_function, 'tf': tf}):
            globals()['model'] = load_model(model_path, safe_mode=False)
        
    file_path = get_predictions(model)
    return {"file_path": file_path}

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