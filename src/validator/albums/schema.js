const Joi = require('joi')

const AlbumSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().integer().required().strict(),
})

module.exports = { AlbumSchema }