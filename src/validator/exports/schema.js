const Joi = require('joi')

const ExportsSchema = Joi.object({
    targetEmail: Joi.string().email({ tlds: true }).required()
})

module.exports = ExportsSchema