import os
import sys

# Add the backend path to sys.path so modules can be imported
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'JanMitra-master', 'backend'))
sys.path.append(backend_dir)

# Change working directory so local files like translation_cache.json can be read
os.chdir(backend_dir)

from fastapi import FastAPI
from main import app as original_app

app = FastAPI()
app.mount("/api", original_app)
