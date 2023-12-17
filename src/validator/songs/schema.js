const Joi = require('joi')

const SongSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().integer().required().strict(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number().integer().strict(),
    albumId: Joi.string(),
})

module.exports = { SongSchema }