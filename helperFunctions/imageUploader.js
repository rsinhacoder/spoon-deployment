import multer from "multer";
import path from "path";

const storageProfilePictures = multer.diskStorage({
  destination: "./upload/ProfilePictures",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const storageCategoryImages = multer.diskStorage({
  destination: "./upload/CategoryImages",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const storageItemImages = multer.diskStorage({
  destination: "./upload/ItemImages",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

export const errHandler = (error, request, response, next) => {
  if (error instanceof multer.MulterError) {
    response.json({
      data: null,
      message: "File size is more than 10 MB.",
      staus: 400,
      success: false,
    });
  }
};

export const uploadProfilePictures = multer({
  storage: storageProfilePictures,
  limits: { fileSize: 10000000 }, //10MB in bytes
});

export const uploadCategoryImages = multer({
  storage: storageCategoryImages,
  limits: { fileSize: 10000000 }, //10MB in bytes
});

export const uploadItemImages = multer({
  storage: storageItemImages,
  limits: { fileSize: 10000000 }, //10MB in bytes
});
