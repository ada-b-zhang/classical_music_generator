from mcp.server.fastmcp import FastMCP, Context
import os
import requests
import pygame
import asyncio

# Create an MCP server
mcp = FastMCP("AI Sticky Notes", dependencies=["requests"])

NOTES_FILE = os.path.join(os.path.dirname(__file__), "notes.txt")

def ensure_file():
    if not os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, "w") as f:
            f.write("")

@mcp.tool()
def add_note(message: str) -> str:
    """
    Append a new note to the sticky note file.

    Args:
        message (str): The note content to be added.

    Returns:
        str: Confirmation message indicating the note was saved.
    """
    ensure_file()
    with open(NOTES_FILE, "a") as f:
        f.write(message + "\n")
    return "Note saved!"

@mcp.tool()
def read_notes() -> str:
    """
    Read and return all notes from the sticky note file.

    Returns:
        str: All notes as a single string separated by line breaks.
             If no notes exist, a default message is returned.
    """
    ensure_file()
    with open(NOTES_FILE, "r") as f:
        content = f.read().strip()
    return content or "No notes yet."

@mcp.resource("notes://latest")
def get_latest_note() -> str:
    """
    Get the most recently added note from the sticky note file.

    Returns:
        str: The last note entry. If no notes exist, a default message is returned.
    """
    ensure_file()
    with open(NOTES_FILE, "r") as f:
        lines = f.readlines()
    return lines[-1].strip() if lines else "No notes yet."

@mcp.prompt()
def note_summary_prompt() -> str:
    """
    Generate a prompt asking the AI to summarize all current notes.

    Returns:
        str: A prompt string that includes all notes and asks for a summary.
             If no notes exist, a message will be shown indicating that.
    """
    ensure_file()
    with open(NOTES_FILE, "r") as f:
        content = f.read().strip()
    if not content:
        return "There are no notes yet."

    return f"Summarize the current notes: {content}"

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
    
# @mcp.tool()
# async def play_music(file_path: str) -> str:
#     """
#     Play a music file.
#     """
#     # Initialize pygame mixer
#     pygame.mixer.init()
    
#     # Load the sound file
#     sound = pygame.mixer.Sound(f'/Users/nicholasbarsi-rhyne/Projects/classical_music_generator/model/{file_path}')
#     # sound = pygame.mixer.Sound(file_path)

#     # Play the sound
#     channel = sound.play()

#     start_time = pygame.time.get_ticks()
#     duration = int(sound.get_length() * 1000)  # Convert to milliseconds
    
#     # Wait for at most the duration of the sound
#     while channel.get_busy() and pygame.time.get_ticks() - start_time < duration:
#         await asyncio.sleep(0.1)  # Short sleep to prevent CPU hogging
    
#     # We don't quit pygame here

#     return "Music played successfully!"


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