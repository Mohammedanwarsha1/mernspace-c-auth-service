import { checkSchema } from "express-validator";
import { emitWarning } from "node:process";

export default checkSchema({
    email: {
        trim: true,
        errorMessage: "Email is required!",
        notEmpty: true,
        isEmail: {
            errorMessage: "Email should be valid email",
        },
    },
    firstName: {
        errorMessage: "First name is required",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "First name is required",
        notEmpty: true,
        trim: true,
    },
    password: {
        trim: true,
        errorMessage: "Last Name is required",
        notEmpty: true,
        isLength: {
            options: {
                min: 8,
            },
            errorMessage: "Password Length should be atleast 8 chares!",
        },
    },
    role: {
        errorMessage: "Role is required!",
        notEmpty: true,
        trim: true,
    },
});
