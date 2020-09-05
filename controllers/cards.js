const Card = require('../models/card');
// const card = require('../models/card');

module.exports.getCards = ((req, res) => {
  Card.find({})
    .then((cards) => {
      if (!cards.length) {
        res.status(404).send({ message: 'Карточки отсутствуют' });
        return;
      }
      res.send({ data: cards });
    })
    .catch(() => {
      res.status(500).send({ message: 'Запрашиваемый ресурс не найден' });
    });
});

module.exports.createCard = ((req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card });
    })
    .catch(() => {
      res.status(404).send({ message: 'Невалидные данные' });
    });
});

// module.exports.deleteCard = ((req, res) => {
//   Card.findByIdAndRemove(req.body._id)
//     .then((card) => {
//       console.log(card);
//       res.send({ data: card });
//     })
//     .catch((err) => {
//       res.status(404).send({ message: err.message });
//     });
// });

module.exports.deleteCard = ((req, res) => {
  Card.findById(req.body._id)
    .then((card) => {
      if (String(card.owner) !== req.user._id) {
        res.status(403).send({ message: 'Вы не можете удалять карточки других пользователей' });
        return;
      }
      card.remove();
      res.send({ data: card });
    })
    .catch((err) => {
      res.status(404).send({ message: err.message });
    });
});
