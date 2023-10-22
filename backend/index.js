const express = require('express');
const cors = require('cors');

const Fingerprint = require('express-fingerprint');
const useragent = require('express-useragent');
const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');
const sequelize = require('./models/database');

const Posts = require('./models/posts');
const Posts_has_categories = require('./models/posts_has_categories');
const Categories = require('./models/categories');
const Likes = require('./models/likes');
const Comments = require('./models/comments');
const Images = require('./models/images');
const Views = require('./models/views');
const Reposts = require('./models/reposts');
const Subscriptions = require('./models/subscriptions');

const Users = require('./models/users');
const refreshSessions = require('./models/refreshSessions');

sequelize.sync().then(() => {
    console.log('Database is ready');
}).catch((err) => {
    console.error('Failed to connect to the database: ', err);
});

const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env')});
const app = express();

app.use(cors({
    credentials: true,
    origin: ['https://nice-evolution-joke.ru', 'http://nice-evolution-joke.ru', 'http://localhost:3000']
}));
app.use(cookieParser());
app.use(Fingerprint());
app.use(useragent.express());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', require('./routers/index'));

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});