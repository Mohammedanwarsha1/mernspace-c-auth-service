import { checkSchema } from "express-validator";

export default checkSchema(
    {
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    //2 or '2' ---->2
                    //undefined or kjhfjkwe ---->NaN
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 1 : parsedValue;
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 6 : parsedValue;
                },
            },
        },
    },
    ["query"],
);
