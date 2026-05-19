import { param, body } from "express-validator";

const createAnnouncementValidator = [
    param("groupId").isMongoId().withMessage("Invalid groupId"),

    body("title")
        .isString()
        .withMessage("title must be a string")
        .notEmpty()
        .withMessage("title is required")
        .isLength({min: 1 , max: 200})
        .withMessage("Title must be less then 200 characters"),

    body("body")
        .isString()
        .withMessage("body must be a string")
        .notEmpty()
        .withMessage("body is required")
        .isLength({min: 1 , max: 2000})
        .withMessage("Body must be less then 2000 characters"),
]

const getAnnouncementValidator = [
    param("groupId").isMongoId().withMessage("Invalid groupId")
]

const updateAnnouncementValidator = [
    param("announcementId").isMongoId().withMessage("Invalid announcementId"),

    body().custom((value) => {
        return Object.keys(value || {}).some((key) => ["title", "body", "isPinned"].includes(key));
    }).withMessage("At least one field must be updated"),

    body("title")
        .optional()
        .isString()
        .withMessage("title must be a string")
        .isLength({min: 1 , max: 200})
        .withMessage("Title must be less then 200 characters"),

    body("body")
        .optional()
        .isString()
        .withMessage("body must be a string")
        .isLength({min: 1 , max: 2000})
        .withMessage("Body must be less then 2000 characters"),

    body("isPinned")
        .optional()
        .isBoolean()
]

const deleteAnnouncementValidator = [
    param("announcementId").isMongoId().withMessage("Invalid announcementId")
]

export {
    createAnnouncementValidator,
    getAnnouncementValidator,
    updateAnnouncementValidator,
    deleteAnnouncementValidator
}