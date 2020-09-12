const { celebrate, Joi, errors } = require('celebrate');
const { default: validator } = require('validator');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const cards = require('./routes/cards');
const BadRequest = require('./errors/badrequest-err');
const { createUser, login } = require('./controllers/users');

const validatorURL = (avatar) => {
  if (!validator.isURL(avatar)) {
    throw new BadRequest('urlIsNotValid');
  }
  return avatar;
};

const auth = require('./middlewares/auth');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const { PORT = 3000, BASE_PATH } = process.env;

const { requestLogger, errorLogger } = require('./middlewares/Logger');

app.use(requestLogger);

// краш-тест
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(validatorURL),
  }),
}), (createUser));

app.use('/users', auth, users);
app.use('/cards', auth, cards);

app.use((req, res, next) => {
  next(new BadRequest('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

// eslint-disable-next-line no-unused-vars
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
