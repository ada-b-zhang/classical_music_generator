FROM python:3.11-slim

ENV PYTHONUNBUFFERED=true
ENV APP_HOME=/app
ENV PORT=8080

WORKDIR $APP_HOME

# Install system dependencies, including fluidsynth
RUN apt-get update && \
    apt-get install -y --no-install-recommends fluidsynth && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Ensure requirements are copied explicitly
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app after installing dependencies
COPY . .

# Use JSON array format for CMD to avoid shell signal issues
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]