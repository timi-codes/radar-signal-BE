const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const Profile = require('./model');

const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}

const app = express();

// CONSTANT
const DB_URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 4000;

// SETUP MONGO DATABASE
mongoose.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// MIDDLEWARE
app.use(bodyParser.json());
app.use(cors({
    origin: 'chrome-extension://fkipongejlaaachjiaipijmmnhcacbca',
    credentials: true
}));

app.use(async(req, res, next) => {

    if(req.path !== '/authorize') {
        const token = req.headers.authorization.split(' ')[1];
        if(!token) {
            return res.status(401).send({error: 'You are not authorized'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const profile = await Profile.findOne({ discordId: decoded.userId });
        req.profile = profile;
    }
    next();
});
app.use(routes);


app.listen(PORT, () => {
    console.log(`🌏 Express server started at http://localhost:${PORT}`);
});
