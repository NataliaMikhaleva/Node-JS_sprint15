const router = require('express').Router();

const { getUsers, getUserId } = require('../controllers/users');

router.get('/', (getUsers));
router.get('/', getUserId);

module.exports = router;
