# classical_music_generator

Virtual Environment (Mac)

``` bash
conda env create -f environment.yml
conda activate limewire
```

Note: When pulling changes from the environment.yml, ensure you update your virtual environment
``` bash
conda env update -f environment.yml
```

Install Mongo Locally

Create a `.env` file
```bash
MONGO_URI ="mongodb://localhost:27017/"
```

Commands to install Mongo local (Brew)
``` bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

```
Run Mongo Locally

``` bash
./start_mongo_local.sh
```

Stop Mongo locally
``` bash
./stop_mongo_local.sh
```

Updated the config file, for the mcp server to work
```bash
./install.sh
```

Frontend
```bash
cd client
npm install
npm run start
```

Server for model inference
```bash
cd model
python app.py
```

Getting chat to work
In the root of the project directory, must have a keys.json
```json
{
  "chatbotStore": {
          "apiKey": "OPENAI_KEY_HERE",
          "url": "https://api.openai.com",
          "path": "/v1/chat/completions",
          "model": "gpt-4o",
          "mcp": true
        },
        "defaultChoiceStore": {
          "model": [
            "gpt-4",
            "gpt-4-turbo"
          ]
        }
}
```