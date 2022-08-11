const { Router } = require('express');
const { getProfile, getAuthToken, submitSignal } = require('./controller');

const router = Router();

router.post('/authorize', getAuthToken);
router.get('/profile', getProfile);
router.post('/submitSignal', submitSignal);

module.exports = router;
