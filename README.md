# classical_music_generator

[Link to our Google Drive](https://drive.google.com/drive/u/1/folders/1EO6QKkOhSW1x8nHJ37ySGcSRRkvSHbx6)

Virtual Environment (Mac)

``` bash
conda env create -f environment.yml
conda activate limewire
```

Install Mongo Locally
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
