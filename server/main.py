from mcp.server.fastmcp import FastMCP, Context
import os
import requests

# Create an MCP server
mcp = FastMCP("AI Sticky Notes", dependencies=["requests"])
BACKEND_V1_API_URL = "https://public-api.beatoven.ai/api/v1"
BACKEND_API_HEADER_KEY = "XM1bWK10aOaffhAqQtlGRQ"
NOTES_FILE = os.path.join(os.path.dirname(__file__), "notes.txt")

def ensure_file():
    if not os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, "w") as f:
            f.write("")

@mcp.tool()
def generate_music_through_api(prompt: str) -> str:
    """
    Generate music through the Beatoven.ai API based on a text prompt.

    This function takes a text prompt and generates music using the Beatoven.ai API.
    It handles the composition process, monitors the task status, and downloads the
    generated audio file.

    Args:
        prompt (str): Text description of the music to generate
        output_filename (str): Filename to save the generated audio as

    Returns:
        str: ID of the track, which can be used to download the track later
    """
    request_json = {"prompt": {"text": prompt}, "format": "wav"}
    try:
        response = requests.post(
            f"{BACKEND_V1_API_URL}/tracks/compose",
            json=request_json,
            headers={"Authorization": f"Bearer {BACKEND_API_HEADER_KEY}"},
        )
        
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            data = response.json()
            if not data.get("task_id"):
                raise Exception(data)
            return data['track_id']
    except requests.ConnectionError:
        raise Exception({"error": "Could not connect to beatoven.ai"})
    except Exception as e:
        raise Exception({"error": "Failed to make a request to beatoven.ai"}) from e
    

@mcp.tool()
def check_track_status(task_id: str) -> str:
    """
    Check the status of a music generation task.

    This function queries the Beatoven.ai API to check the status of a music generation task
    using its task ID. It returns the current status and metadata of the task.

    Args:
        task_id (str): The ID of the task to check

    Returns:
        str: JSON response containing task status and metadata. Will include track_url when complete.

    Raises:
        Exception: If there are connection issues or the API request fails
    """
    try:
        response = requests.get(
            f"{BACKEND_V1_API_URL}/tasks/{task_id}",
            headers={"Authorization": f"Bearer {BACKEND_API_HEADER_KEY}"},
        )    
        if response.status_code == 200:
            data = response.json()
            return data['status']
        else:
            raise Exception({"error": "Composition failed"})
    except requests.ConnectionError as e:
        raise Exception({"error": "Could not connect"}) from e
    except Exception as e:
        raise Exception({"error": "Failed to make a request"}) from e



@mcp.tool()
def read_music_file() -> str:
    """
    Search for all music files in the user's Music folder and return a list of them.

    Returns:
        str: A list of all music files in the user's Music folder.
    """
    home_dir = os.path.expanduser("~")
    music_path = os.path.join(home_dir, "Music")

    music_files = []

    try:
        for root, _, files in os.walk(music_path):
            for file in files:
                if file.endswith((".mp3", ".wav", ".m4a", ".flac", ".aac", ".ogg", ".alac", ".mid", ".midi")):
                    rel_path = os.path.relpath(os.path.join(root, file), music_path)
                    music_files.append(rel_path)
        
        if not music_files:
            return "No music files found in your Music folder."
        
        return f"Found {len(music_files)} music files:\n" + "\n".join(music_files[:20]) + \
               ("\n...(more files not shown)" if len(music_files) > 20 else "")
    
    except Exception as e:
        return f"Error accessing Music folder: {str(e)}"

@mcp.tool()
def generate_new_music(text: str) -> str:
    """
    Get predictions from the model for a given text.

    Args:
        text (str): The text to get predictions for.

    Returns:
        str: A list of predictions for the given text.
    """
    try:
        # Convert text input to float values (you may need to adjust this based on your actual requirements)
        # This is a simple example that converts characters to ASCII values
        inputs = [float(ord(c)) for c in text]
        
        # Prepare the request payload
        payload = {
            "inputs": inputs,
            "parameters": {"text": text}  # Optional parameters
        }
        
        # Make request to the FastAPI server
        response = requests.post(
            "http://localhost:8000/predict",
            json=payload
        )
        
        # Check if request was successful
        response.raise_for_status()
        
        # Parse the response
        result = response.json()
        
        # Format the response for display
        return f"Music was generated and saved to {result['file_path']}"
    
    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to the prediction server. Make sure it's running on port 8000."
    except Exception as e:
        return f"Error making prediction: {str(e)}"
    


@mcp.tool()
async def play_music(file_path: str) -> str:
    """
    Play a music file.
    """
    try:
        import asyncio
        import pygame.mixer
        
        # Initialize only the mixer, not all of pygame
        pygame.mixer.init()
        
        full_path = f'/Users/nicholasbarsi-rhyne/Projects/classical_music_generator/model/{file_path}'
        
        # Load the sound file
        try:
            sound = pygame.mixer.Sound(full_path)
        except Exception as e:
            return f"Error loading sound: {str(e)}"
        
        # Play the sound
        channel = sound.play()
        
        # Sleep for a short time to let playback start
        await asyncio.sleep(0.5)
        
        # Return immediately without waiting for the entire sound
        # This prevents blocking the server
        return f"Started playing {file_path} - playback in progress"
        
    except Exception as e:
        return f"Error in play_music: {str(e)}"