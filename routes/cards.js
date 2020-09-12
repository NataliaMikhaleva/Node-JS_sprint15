const { celebrate, Joi } = require('celebrate');
const { default: validator } = require('validator');
Joi.objectId = require('joi-objectid')(Joi);
const router = require('express').Router();
const { getCards, createCard, deleteCard } = require('../controllers/cards');
const BadRequest = require('../errors/badrequest-err');

const validatorURL = (link) => {
  if (!validator.isURL(link)) {
    throw new BadRequest('urlIsNotValid');
  }
  return link;
};

router.get('/', (getCards));
router.post('/', (createCard));
router.post('/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().min(2).custom(validatorURL),
      owner: Joi.objectId().required(),
    }),
  }), (createCard));

router.delete('/:id', (deleteCard));

module.exports = router;
