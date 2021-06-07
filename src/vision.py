import cv2

cascPath = './lib/haarcascade_frontalface_default.xml'
faceCascade = cv2.CascadeClassifier(cascPath)

def get_faces(image_path):
  image = cv2.imread(image_path)
  gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
  raw_faces = faceCascade.detectMultiScale(
    gray,
    scaleFactor=1.1,
    minNeighbors=5,
    minSize=(30, 30),
    flags = cv2.CASCADE_SCALE_IMAGE
  )

  faces = [] if len(raw_faces) == 0 else raw_faces.tolist()

  width = image.shape[1]
  height = image.shape[0]
  
  return (width, height, faces)
    
