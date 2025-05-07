# Build the dockerfile while in this directory:
`docker build -t bachpropagation .`

# Run the dockerfile locally:
`docker run -t bachpropagation .`

# Expose the container:
`docker run -p 8080:8080 bachpropagation`

# Give yourself permissions:
```
sudo gcloud services enable run.googleapis.com
sudo gcloud services enable cloudbuild.googleapis.com
sudo gcloud services enable artifactregistry.googleapis.com
```

# Deploy to cloud:
`sudo gcloud builds submit --tag gcr.io/bachpropagation-459023/bachpropagation`

# Deploy to gcloud:
```
sudo gcloud run deploy bachpropagation \
  --image gcr.io/bachpropagation-459023/bachpropagation \
  --platform managed \
  --region us-west2 \
  --allow-unauthenticated \
  --port 8080
```