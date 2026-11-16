FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Build the React (Vite) frontend
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm install --prefix frontend
COPY frontend ./frontend
RUN npm run build --prefix frontend

COPY . .

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]