# Mentor AI MVP

An intelligent homework evaluation and dashboard platform for teachers and students.

## Prerequisites

Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/) (For Celery background tasks)

## Environment Setup

### 1. Backend Environment

Navigate to the root directory and create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate # On Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL credentials and your **Gemini API Key**.

### 2. Frontend Environment

Navigate to the frontend directory:
```bash
cd frontend
npm install
```

## Running the Project Locally

To test the complete platform locally, you need to run four separate processes in different terminal windows:

### 1. PostgreSQL & Redis
Ensure your PostgreSQL and Redis servers are running in the background.
If you are on Windows, you can use [Memurai](https://www.memurai.com/) or run Redis via WSL/Docker.

### 2. Backend API Server
3. **Run the backend server:**
   ```bash
   .\venv\Scripts\python manage.py runserver
   ```

4. **Run Celery worker (Required for Background tasks & AI extraction):**
   ```bash
   # Make sure Redis is running locally on port 6379, then run:
   .\venv\Scripts\celery -A mentor_ai worker -l info --pool=solo
   ```
   *(Note: `--pool=solo` is recommended for Windows environments)*
The backend will start at: `http://127.0.0.1:8000/`

### 3. Celery Worker (AI Evaluation)
```bash
# In the root directory, activate venv
cd mentor_ai
celery -A mentor_ai worker -l info -P eventlet
```
*Note: On Windows, use `-P eventlet` or `-P gevent` as shown above.*

### 4. Frontend Application
```bash
# In the frontend directory
cd frontend
npm run dev
```
The frontend will start at: `http://localhost:3000/`

## Default Ports
- Frontend: `3000`
- Backend: `8000`
- PostgreSQL: `5432`
- Redis: `6379`

-- Slaommmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

## Troubleshooting
- **Celery errors on Windows**: If you get multiprocessing errors, ensure you run celery with `-P eventlet`. You may need to run `pip install eventlet`.
- **Database connection failed**: Check your `.env` file for the correct `DB_USER` and `DB_PASSWORD`.
- **API calls failing**: Ensure the backend is running on `http://127.0.0.1:8000` and `FRONTEND_URL` in `.env` is correctly pointing to `http://localhost:3000`.



