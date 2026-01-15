import {body} from "express-validator";

const registerValidator = () => {
    return [
        body("name")
            .exists()
            .trim()
            .notEmpty()
            .withMessage("Name field can't be empty")
            .isLowercase()
            .length({min : 3})
            .withMessage("Name must me greater or equal to 3 characters"),
        
        
    ]
}