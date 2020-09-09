const { celebrate, Joi, errors } = require('celebrate');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const users = require('./routes/users');
const cards = require('./routes/cards');
const BadRequest = require('./errors/badrequest-err');

const { createUser, login } = require('./controllers/users');

const auth = require('./middlewares/auth');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const { PORT = 3000, BASE_PATH } = process.env;
app.use(express.static((path.join(__dirname, 'public'))));

const { requestLogger, errorLogger } = require('./middlewares/Logger');

app.use(requestLogger);

app.post('/signin', app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required(),
  }),
}), app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
}), createUser);

app.use('/users', auth, users);
app.use('/cards', auth, cards);
app.use((req, res, next) => {
  next(new BadRequest('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка' : message,
  });
});

console.log(PORT);
app.listen(PORT, () => {
  console.log(`Сервер запущен, порт: ${PORT}.`);
  console.log(BASE_PATH);
});
