const express = require('express');
const router = express.Router();
const { getProfile, getAddress, updateAddressManual, updateAddressLocation, updateProfile } = require('../Controllers/ProfileController');

const auth = require('../Middlewares/AuthValidation');

// Profile Routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Address Routes
router.get('/address', auth, getAddress);
router.put('/address/manual', auth, updateAddressManual);
router.put('/address/location', auth, updateAddressLocation);

module.exports = router;