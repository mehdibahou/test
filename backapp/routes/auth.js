// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../ExpressControllers/authController');

router.get('/check-users', authController.checkUsers);
router.post('/signin', authController.signIn);
router.post('/signup', authController.signUp);

module.exports = router;