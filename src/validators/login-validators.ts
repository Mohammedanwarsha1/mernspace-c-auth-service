import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required",
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: "Email Should be valid email",
        },
    },
    password: {
        trim: true,
        errorMessage: "last name is required",
        notEmpty: true,
    },
});

//export default [body("email").notEmpty().withMessage("email is required")];
