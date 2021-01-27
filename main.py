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
      filenames.append({"dir": dir, "path": "/storage/%s" % os.path.join(dir, name) })
    if os.path.isdir(item):
      filenames += deepGetFile(root, os.path.join(dir, name))

  return filenames

filenames = deepGetFile(STORAGE_DIR, '')

# run server
app = FastAPI()

@app.get("/images")
def read_item():
  return random.sample(filenames, len(filenames))

app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")
app.mount("/", StaticFiles(directory="static", html=True), name="static")