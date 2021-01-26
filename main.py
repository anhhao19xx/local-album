import os
from typing import Optional

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from os import walk
import random

# import album
STORAGE_DIR = os.environ['STORAGE']
_, _, filenames = next(walk(STORAGE_DIR))
filenames = list(map(lambda name: "/storage/%s" % name, filenames))

# run server
app = FastAPI()

@app.get("/images")
def read_item():
  return random.sample(filenames, len(filenames))

app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")
app.mount("/", StaticFiles(directory="static", html=True), name="static")