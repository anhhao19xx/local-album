import uvicorn
import os
from typing import Optional

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from os import walk
import random

# import album
STORAGE_DIR = os.environ['STORAGE']
def deepGetFile(root, dir):
  print('Get from ' + (dir if dir else '.'))
  currentDir = os.path.join(root, dir)
  filenames = []

  for name in os.listdir(currentDir):
    item = os.path.join(currentDir, name)
    if os.path.isfile(item):
      filenames.append({"dir": dir, "path": "/storage/%s" % os.path.join(dir, name), "realPath": os.path.join(dir, name) })
    if os.path.isdir(item):
      filenames += deepGetFile(root, os.path.join(dir, name))

  return filenames

# get images
filenames = deepGetFile(STORAGE_DIR, '.')

# run server
app = FastAPI()

@app.get("/images/")
def read_item(dir: str = ''):
  if dir == '.' or dir == '':
    selected_files = filenames
  else:
    selected_files = list(filter(lambda x: x['dir'] == dir, filenames))
  return random.sample(selected_files, len(selected_files))

@app.delete("/images/")
def delete_item(path: str = ''):
  fullPath = os.path.join(STORAGE_DIR, path)
  os.remove(fullPath)
  return {
    "ok": 1
  }

@app.get("/info/")
def info_item(path: str = ''):
  fullPath = os.path.join(STORAGE_DIR, path)
  return {
    'faces': [
      [20, 20, 50, 50]
    ]
  }

app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
  uvicorn.run("main:app", host="0.0.0.0", port=5000, log_level="info")