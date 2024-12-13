const multer = require('multer');
const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const { storage } = require('../configurations/FirebaseServiceAccountKey');

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

const uploadFileToFirebase = (Model, id) => async (req, res, next) => {
  try {
    const user = await Model.findById(id);
    if (!user) {
      return res.status(400).send({ success: false, message: 'User not found' });
    }

    // If the user already has a signature, delete the existing file from Firebase Storage
    if (user.signature) {
      try {
        const oldFileRef = ref(storage, user.signature);
        await deleteObject(oldFileRef);
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          console.warn(`Firebase Storage: Object '${user.signature}' does not exist. Skipping deletion.`);
        } else {
          console.error(`Error deleting old file from Firebase Storage: ${error.message}`);
          return res.status(500).send({ success: false, message: 'Failed to delete existing file' });
        }
      }
    }

    if (!req.file) {
      return res.status(400).send({ success: false, message: 'No file uploaded' });
    }

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    await uploadBytes(storageRef, req.file.buffer, { contentType: req.file.mimetype });
    const publicUrl = await getDownloadURL(storageRef);

    req.fileUrl = publicUrl;
    next();
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: 'Failed to handle file upload' });
  }
};

const uploadFileToFirebaseWithoutDeletingPrevious = async (req, res, next) => {

  try {

    if (!req.file) {
      return res.status(400).send({ success: false, message: 'No file uploaded' });
    }

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    await uploadBytes(storageRef, req.file.buffer, { contentType: req.file.mimetype });
    const publicUrl = await getDownloadURL(storageRef);

    req.fileUrl = publicUrl;
    next();
  } catch (error) {
    res.status(500).send({ success: false, message: 'Failed to handle file upload' });
  }
};

const uploadFileObjectToFirebase = async (fileObject, userId) => {
  if(!fileObject)
    return;

  const fileName = `${Date.now()}_${userId}_${fileObject.originalname}`;
  const storageRef = ref(storage, `uploads/${fileName}`);
  await uploadBytes(storageRef, fileObject.buffer, { contentType: fileObject.mimetype });
  const publicUrl = await getDownloadURL(storageRef);

  return publicUrl;
}

const uploadFileObjectToFirebaseByAdmin = async (fileObject) => {
  if(!fileObject)
    return;

  const fileName = `${Date.now()}_${fileObject.originalname}`;
  const storageRef = ref(storage, `uploads/${fileName}`);
  await uploadBytes(storageRef, fileObject.buffer, { contentType: fileObject.mimetype });
  const publicUrl = await getDownloadURL(storageRef);

  return publicUrl;
}
module.exports = { upload, uploadFileToFirebase, uploadFileToFirebaseWithoutDeletingPrevious, uploadFileObjectToFirebase, uploadFileObjectToFirebaseByAdmin };
