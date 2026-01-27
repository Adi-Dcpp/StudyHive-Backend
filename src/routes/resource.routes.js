import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middlewares.js";
import validate from "../middlewares/validators.middlewares.js";
import { uploadResource, getResourceByGroup, deleteResource } from "../controllers/resource.controllers.js"
import {
  uploadResourceValidator,
  getResourcesValidator,
  deleteResourceValidator,
} from "../validators/resource.validators.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.post(
    "/:groupId",
    verifyJwt,
    authorizeRoles("mentor"),
    upload.single("file"),
    uploadResourceValidator(),
    validate,
    uploadResource,
)

router.get(
  "/:groupId",
  verifyJwt,
  getResourcesValidator(),
  validate,
  getResourceByGroup
);

router.delete(
  "/:resourceId",
  verifyJwt,
  deleteResourceValidator(),
  validate,
  deleteResource
);

export default router;