const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mongoUri = process.env.DB_CONN;

function connect() {
    return mongoose.connect(mongoUri, { useNewUrlParser: true });
}

module.exports = {
    connect,
    mongoose
}