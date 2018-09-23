const User = require('../models/user');
const ReadPreference = require('mongodb').ReadPreference;
const jwt = require('jwt-simple');
const crypto = require('crypto');

require('../mongo').connect();

function getUsers(req, res){
    const docquery = User.find({}).read(ReadPreference.NEAREST);
    docquery.exec()
        .then(trans => {
            res.status(200).json(trans);
        })
        .catch(error => {
            res.status(500).send(error);
            return;
    });
}


function addUser(req, res) {
    const user = req.body;
    // Check For User
    User.findOne({ email: user.email }, (error, qry) => {
        if (checkServerError(res, error)) return;
        if (qry) { res.status(409).send('User already exists!'); return; }

        const newUser = new User(user);
        const passwordHash = hashPassword(user.password);
        let d = new Date();
        newUser.createdOn = d;
        newUser.password = passwordHash.hash;
        newUser.salt = passwordHash.salt;
        newUser.lastLogin = null;
        newUser.lockedUntil = d.setMinutes(d.getMinutes() - 15);
        newUser.failedLoginAttempts = 0;

        newUser.save(error => {
            if (checkServerError(res, error)) return;
            res.status(200).json(newUser);
        });
    });
}

function removeUser(req, res) {
    // Check For User
    const email = req.body.email;
    User.findOneAndDelete({ email: email }, (error, qry) => {
        if (checkServerError(res, error)) return;
        if (!checkFound(res, qry)) return;
        res.status(200).send();
        return;
    });
}

function loginUser(req, res) {
    const login = req.body;
    // Check For User
    User.findOne({ email: login.email }, (error, qry) => {
        if (checkServerError(res, error)) return;
        if (!checkFound(res, qry)) return;

        // TODO: do login attempt validation

        const check = checkPasswordHash(login.password, qry.salt);
        if(check !== qry.password){
            // Check failed attempts
            qry.failedLoginAttempts = qry.failedLoginAttempts + 1;
            if (qry.failedLoginAttempts >= 5) {
                let d = new Date();
                qry.lockedUntil = d.setMinutes(d.getMinutes + 15);
                qry.save();
                res.status(404).send('Account is locked due to too many failed login attempts!');
                return;
            }
            qry.save();
            res.status(404).send('Password is invalid!');
            return;
        }

        // Valid Login
        let d = new Date();
        qry.lastLogin = d;
        qry.failedLoginAttempts = 0;
        qry.lockedUntil = d.setMinutes(d.getMinutes() - 15);
        qry.save(error => {
            if (checkServerError(res, error)) return;

            // Create JWT token
            var payload = { 'email': qry.email, 'name': qry.name };
            var token = jwt.encode(payload, 'myfishinhole_234kdkdkdk');
            res.status(200).send(token);
        });

    });
}

function checkServerError(res, error) {
    if(error) {
        res.status(500).send(error);
        return error;
    }
}

function checkFound(res, item) {
    if(!item) {
        res.status(404).send('User not found.');
        return;
    }
    return item;
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: hash
    };
}

function checkPasswordHash(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
}

module.exports = {
    getUsers,
    removeUser,
    addUser,
    loginUser
}