const express = require('express');
const router = express.Router();

const userService = require('../services/userService');

router.get('/users', (req, res) => {
    userService.getUsers(req, res);
})

router.post('/user', (req, res) => {
    userService.addUser(req, res);
})

router.post('/users/login', (req, res) => {
    userService.loginUser(req, res);
});

router.delete('/user', (req, res) => {
    userService.removeUser(req, res);
});

module.exports = router;