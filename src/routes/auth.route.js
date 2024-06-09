const express = require('express');
const router = express.Router();

const {authController} = require('../controllers');
const authValidation = require('../validations/auth.validations');
const validate = require('../middlewares/validate');


router.post('/login',validate(authValidation.login), authController.loginUser);

router.post(
  '/register',
  validate(authValidation.register),
  authController.registerUser
);


module.exports = router;