import os
import uvicorn

from pprint import pprint
from src.vision import get_faces
from tinydb import TinyDB, Query
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from src.scan import scan_dir, get_item

# Resources preparation
STORAGE_DIR = os.environ['STORAGE']
db = TinyDB(os.path.join(STORAGE_DIR, '.db'))

item_list = scan_dir(STORAGE_DIR)

table = db.table('items')
Item = Query()

for item in table.all():
  new_item = get_item(STORAGE_DIR, item['path'])
  if new_item is None:
    table.remove(doc_ids=[item.doc_id])

for raw_item in item_list:
  item = table.get(Item.path == raw_item['path'])
  if item:
    continue
  
  if raw_item['mime'] and raw_item['mime'].find('image') == 0:
    print('Scan faces in %s' % raw_item['path'])
    width, height, raw_faces = get_faces(os.path.join(STORAGE_DIR, raw_item['path']))

    faces = []
    face_id = 0
    for face in raw_faces:
      faces.append({
        'id': face_id,
        'tag': None,
        'pos': face
      })
      face_id += 1

    raw_item['image'] = {
      'width': width,
      'height': height,
      'faces': faces
    }

  table.insert(raw_item)

# Server listener
app = FastAPI()

@app.get("/images/")
def read_item():
  items = table.all()
  for item in items:
    item['id'] = item.doc_id

  return items

app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
  uvicorn.run("main:app", host="0.0.0.0", port=5000, log_level="info")