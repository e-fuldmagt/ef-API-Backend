// Define the Joi schema for validation

const Joi = require("@hapi/joi"); 

const passwordSchema = Joi.object({
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one special character, and one number",
        "any.required": "Password is required",
      }),
  });

  module.exports = { passwordSchema };