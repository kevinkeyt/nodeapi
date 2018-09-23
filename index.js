var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var app = express();

const userRoutes = require('./routes/userRoutes');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(3000);