import { param, body } from "express-validator";

const createAnnouncementValidator = [
    param(groupId).isMongoId().withMessage("Invalid groupId"),

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
        .isLength({min: 1 , max: 200})
        .withMessage("Body must be less then 200 characters"),
]

const getAnnouncementValidator = [
    param(groupId).isMongoId().withMessage("Ivalid groupId")
]

const updateAnnouncementValidator = [
    param(announcementId).isMongoId().withMessage("Invalid announcementId"),
    
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
        .isLength({min: 1 , max: 200})
        .withMessage("Body must be less then 200 characters"),
    
    body("isPinned")
        .exists()
        .isBoolean()
]

const deleteAnnouncementValidator = [
    param(groupId).isMongoId().withMessage("Ivalid groupId")
]

export {
    createAnnouncementValidator,
    getAnnouncementValidator,
    updateAnnouncementValidator,
    deleteAnnouncementValidator
}