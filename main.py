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

# run server
app = FastAPI()

@app.get("/images/")
def read_item(dir: str = ''):
  filenames = deepGetFile(STORAGE_DIR, dir)
  return random.sample(filenames, len(filenames))

@app.delete("/images/")
def delete_item(path: str = ''):
  fullPath = os.path.join(STORAGE_DIR, path)
  try:
    os.remove(fullPath)
    return {
      "ok": 1
    }
  except IOError:
    return {
      "ok": 0
    }

app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")
app.mount("/", StaticFiles(directory="static", html=True), name="static")