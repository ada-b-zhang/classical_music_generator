from google.cloud import storage
from google.auth.credentials import AnonymousCredentials
import tensorflow as tf
from tensorflow.keras.models import load_model
from utils import get_predictions

storage_client = storage.Client(credentials = AnonymousCredentials(), project="corgi-news")
bucket = storage_client.bucket("music_gen_all_midi")
blob = bucket.blob("model_weights/music_generation_model.keras")
blob.download_to_filename("music_generation_model.keras")

def helper_function(x):
    return tf.reduce_sum(x, axis=1)

model = load_model('music_generation_model.keras', safe_mode=False, custom_objects={'helper_function': helper_function,'tf':tf})
# model = load_model('ada_needs_boba.keras')
if model is not None:
    print("Model loaded correctly!")

get_predictions(model)