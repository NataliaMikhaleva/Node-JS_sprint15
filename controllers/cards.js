const Card = require('../models/card');
const NotFoundError = require('../errors/notfound-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getCards = ((req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards.length) {
        throw new NotFoundError('Карточки отсутствуют');
      }
      res.send({ data: cards });
    })
    .catch(next);
});

module.exports.createCard = ((req, res, next) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotFoundError('Невалидные данные'));
        return;
      }
      next(err);
    });
});

module.exports.deleteCard = ((req, res, next) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Карточка отсутствует');
      }
      if (String(card.owner) !== req.user._id) {
        throw new ForbiddenError('Вы не можете удалять карточки других пользователей');
      } else {
        card.remove().then((deletedCard) => res.send(deletedCard));
      }
    })
    .catch(next);
});
