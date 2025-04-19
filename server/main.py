from mcp.server.fastmcp import FastMCP
import os

# Create an MCP server
mcp = FastMCP("AI Sticky Notes")

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
                if file.endswith((".mp3", ".wav", ".m4a", ".flac", ".aac", ".ogg", ".alac")):
                    rel_path = os.path.relpath(os.path.join(root, file), music_path)
                    music_files.append(rel_path)
        
        if not music_files:
            return "No music files found in your Music folder."
        
        return f"Found {len(music_files)} music files:\n" + "\n".join(music_files[:20]) + \
               ("\n...(more files not shown)" if len(music_files) > 20 else "")
    
    except Exception as e:
        return f"Error accessing Music folder: {str(e)}"



