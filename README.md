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
