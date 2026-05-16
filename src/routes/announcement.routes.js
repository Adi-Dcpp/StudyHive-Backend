import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import validate from "../middlewares/validators.middlewares.js";
import {
    createAnnouncement,
    getAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcement.controllers.js"
import {
    createAnnouncementValidator,
    getAnnouncementValidator,
    updateAnnouncementValidator,
    deleteAnnouncementValidator,
} from "../validators/announcement.validators.js"

const router = Router();

router.post("/:groupId",
            verifyJwt,
            createAnnouncementValidator,
            validate,
            createAnnouncement
        );

router.get("/:groupId",
            verifyJwt,
            getAnnouncementValidator,
            validate,
            getAnnouncement
        );

router.put("/:announcementId",
            verifyJwt,
            updateAnnouncementValidator,
            validate,
            updateAnnouncement
        );

router.delete("/:announcementId",
                verifyJwt,
                deleteAnnouncementValidator,
                validate,
                deleteAnnouncement
        );

export default router;