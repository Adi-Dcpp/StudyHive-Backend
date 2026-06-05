import multer from 'multer'
import path from 'path'
import os from 'os'

import { ApiError } from '../utils/api-error.utils.js'
import { RequestLimits } from '../utils/constants.utils.js'

/*
  SUPPORTED FILE TYPES
*/
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

/*
  STORAGE
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir())
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9)

    cb(
      null,
      uniqueSuffix +
        path.extname(file.originalname)
    )
  },
})

/*
  FILE FILTER
*/
const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return cb(
      new ApiError(
        400,
        'Invalid file type. Only images and PDFs are allowed.'
      ),
      false
    )
  }

  cb(null, true)
}

/*
  UPLOAD
*/
const upload = multer({
  storage,

  /*
    FILE SIZE LIMITS

    Current:
    100 MB

    Enough for:
    - large PDFs
    - lecture notes
    - books
    - scanned docs

    Still safe enough to avoid abuse.
  */
  limits: {
    fileSize:
      RequestLimits
        .FILE_UPLOAD_MAX_BYTES ||
      100 * 1024 * 1024,
  },

  fileFilter,
})

export { upload }