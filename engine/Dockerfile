FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema para compilar uvloop y pyzmq
RUN apt-get update && apt-get install -y build-essential gcc

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
