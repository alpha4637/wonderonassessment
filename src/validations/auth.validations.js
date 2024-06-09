const Joi = require('joi');

const baseRegisterSchema = {
  username: Joi.string()
    .trim()
    .required(),
  email: Joi.string()
    .email()
    .trim()
    .required(),
  password: Joi.string()
    .min(6)
    .required()
};

const register = {
  body: Joi.object().keys({
    ...baseRegisterSchema,
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .trim()
      .required(),
    password: Joi.string()
      .min(6)
      .required(),
  }),
};

module.exports = {
  register,
  login,
};