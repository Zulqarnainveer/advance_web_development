/**
 * routes/authRoutes.js
 */
const express = require('express');
const router  = express.Router();

const authController = require('../controllers/authController');
const { isGuest }    = require('../middleware/auth');
const { registerRules, loginRules, handleValidation } = require('../middleware/validator');

router.get('/register', isGuest, authController.getRegister);
router.post('/register', isGuest, registerRules, handleValidation('/auth/register'), authController.postRegister);

router.get('/login',  isGuest, authController.getLogin);
router.post('/login', isGuest, loginRules, handleValidation('/auth/login'), authController.postLogin);

router.post('/logout', authController.logout);

module.exports = router;
