FROM python:3.11

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy and install required Python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code
COPY backend .

# Expose the application port
EXPOSE 8000

# Start the application server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]