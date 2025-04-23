#!/bin/bash

# Determine the project root directory (where this script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Configuration
CONFIG_DIR="$SCRIPT_DIR"

# Get directory containing the classical_music_generator project
PROJECT_DIR="$( cd "$SCRIPT_DIR" && cd .. && pwd )"

# Verify we found the right directory
if [[ ! -d "$PROJECT_DIR/classical_music_generator" ]]; then
  echo "Error: Could not find classical_music_generator directory."
  echo "This script should be placed in the parent directory of classical_music_generator."
  exit 1
fi

# Detect desktop path
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  DESKTOP_PATH="$HOME/Desktop"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  DESKTOP_PATH="$HOME/Desktop"
  # Check if XDG_DESKTOP_DIR is defined
  if [ -f "$HOME/.config/user-dirs.dirs" ]; then
    source "$HOME/.config/user-dirs.dirs"
    if [ ! -z "$XDG_DESKTOP_DIR" ]; then
      DESKTOP_PATH="${XDG_DESKTOP_DIR/#\~/$HOME}"
    fi
  fi
else
  # Windows or other
  DESKTOP_PATH="$HOME/Desktop"
fi

# Project paths
CMG_DIR="$PROJECT_DIR/classical_music_generator"
SERVER_SCRIPT_PATH="$CMG_DIR/server/main.py"

echo "Detected paths:"
echo "- Project directory: $PROJECT_DIR"
echo "- Classical music generator: $CMG_DIR"
CONFIG_FILE="$CMG_DIR/client/src/main/config.json"

# Create config.json with detected paths
cat > "$CONFIG_FILE" << EOF
{
    "mcpServers": {
      "everything": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-everything"
        ]
      },
      "filesystem": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "$CMG_DIR/",
          "$DESKTOP_PATH/"
        ]
      },
      "demo": {
        "command": "uv",
        "args": [
          "run",
          "--with",
          "mcp[cli], requests",
          "mcp",
          "run",
          "$SERVER_SCRIPT_PATH"
        ]
      }
    }
}
EOF

GREEN="\033[0;32m"
RED="\033[0;31m"

# Check if file was created successfully
if [ -f "$CONFIG_FILE" ]; then
  echo -e "${GREEN}Configuration file created successfully at: $CONFIG_FILE${NC}"
else
  echo -e "${RED}Failed to create configuration file.${NC}"
  exit 1
fi