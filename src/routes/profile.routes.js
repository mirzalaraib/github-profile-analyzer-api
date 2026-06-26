const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

// Trigger profile analysis and store insights
router.post('/', profileController.analyzeProfile);

// Fetch list of all analyzed profiles (optionally filter/sort)
router.get('/', profileController.getAllProfiles);

// Fetch detailed data of a single profile
router.get('/:username', profileController.getProfile);

// Delete an analyzed profile record
router.delete('/:username', profileController.deleteProfile);

module.exports = router;
