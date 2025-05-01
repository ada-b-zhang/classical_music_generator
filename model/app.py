from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from tensorflow.keras.models import load_model
import uvicorn
import tensorflow as tf

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
    prediction: List[float]
    model_version: str
    processing_time: float

# Mock prediction function (replace with your actual model)
async def make_prediction(inputs, parameters=None):
    # This is where you would call your actual model
    import time
    import random
    
    # Simulate processing time
    start_time = time.time()
    time.sleep(0.1)  # Simulate model inference time
    
    # Return mock predictions
    predictions = [x * random.random() for x in inputs]
    processing_time = time.time() - start_time
    
    return {
        "prediction": predictions,
        "model_version": "v1.0",
        "processing_time": processing_time
    }

# Define the prediction route
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):

    print(request)
    model = load_model('music_generation_model.keras', safe_mode=False, custom_objects={'helper_function': helper_function,'tf':tf})
    print(model.summary())
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