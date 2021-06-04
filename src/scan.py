import os
import filetype

DIRECTORY_MIME = 'inode/directory'

def get_type(file_path):
  if os.path.isdir(file_path):
    return DIRECTORY_MIME
    
  kind = filetype.guess(file_path)
  if kind is None:
    return None
  return kind.mime

def get_stat(file_path):
  stat = os.stat(file_path)

  ctime = int(stat.st_ctime * 1000)
  mtime = int(stat.st_mtime * 1000)

  return {
    'size': stat.st_size,
    'updated_at': ctime if ctime > mtime else mtime
  }

def scan_dir(root, dir = ''):
  absolute_dir_path = os.path.join(root, dir)
  item_list = []

  for name in os.listdir(absolute_dir_path):
    if name[0] == '.':
      continue

    absolute_item_path = os.path.join(absolute_dir_path, name)
    relative_item_path = os.path.join(dir, name)

    item = {
      'path': relative_item_path,
      'mime': get_type(absolute_item_path),
      **get_stat(absolute_item_path)
    }

    item_list.append(item)

    if item['mime'] == DIRECTORY_MIME:
      item_list += scan_dir(root, item['path'])
    

  return item_list

