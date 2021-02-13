source venv/bin/activate
export STORAGE=$1
uvicorn main:app --reload --host 0.0.0.0