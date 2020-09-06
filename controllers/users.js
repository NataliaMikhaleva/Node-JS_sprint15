const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserError = require('../errors/user-err');
const PasswordError = require('../errors/password-err');

module.exports.getUsers = ((req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users.length) {
        // res.status(404).send({ message: 'Пользователи отсутствуют' });
        throw new UserError('Пользователи отсутствуют');
        // return;
      }
      res.send({ data: users });
    })
    .catch(next);
    // .catch(() => {
    //   res.status(500).send({ message: 'Запрашиваемый ресурс не найден' });
    // });
});

module.exports.getUserId = ((req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user.length) {
        // res.status(404).send({ message: 'Нет такого пользователя' });
        throw new UserError('Нет такого пользователя');
        // return;
      }
      res.send({ data: user });
    })
    .catch(next);
    // .catch(() => {
    //   res.status(404).send({ message: 'Невалидные данные' });
    // });
});

module.exports.createUser = ((req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;
  if (typeof password === 'undefined') {
    // return res.status(400).send({ message: 'Пароль не передан' });
    throw new PasswordError('Пароль не передан');
  }
  if (password.length < 8 || /\s/.test(password)) {
    // return res.status(400).send({ message: 'Пароль не прошел валидацию' });
    throw new PasswordError('Пароль не прошел валидацию');
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
      // х.з. как централизовывать
      if (err.code === 11000) {
        res.status(409).send({ message: 'Такой пользователь уже существует' });
        return;
      }
      res.status(404).send({ message: 'Невалидные данные' });
    });
});

module.exports.login = ((req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
});
