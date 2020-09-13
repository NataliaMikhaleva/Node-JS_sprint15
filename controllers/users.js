const bcrypt = require('bcryptjs');

const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/notfound-err');
const BadRequest = require('../errors/badrequest-err');
const ConflictError = require('../errors/conflict-err');

module.exports.getUsers = ((req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users.length) {
        throw new NotFoundError('Пользователи отсутствуют');
      }
      res.send({ data: users });
    })
    .catch(next);
});

module.exports.getUserId = ((req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new NotFoundError('Нет такого пользователя');
    })
    .then((user) => {
      res.send({ data: user });
      // return;
    })
    .catch(next);
});

module.exports.createUser = ((req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;
  if (typeof password === 'undefined') {
    throw new BadRequest('Пароль не передан');
  }
  if (password.length < 8 || /\s/.test(password)) {
    throw new BadRequest('Пароль не прошел валидацию');
  }
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      res.send({
        data: {
          _id: user._id,
          email: user.email,
        },
      });
    })
    .catch((err) => {
      if (err.code === 11000 && err.name === 'MongoError') {
        next(new ConflictError('Такой пользователь уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new NotFoundError('Невалидные данные'));
        return;
      }
      next(err);
    });
});

module.exports.login = ((req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
      next(err);
    });
});
