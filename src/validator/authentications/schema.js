const Joi = require('joi')

const PostAuthenticationSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

const PutOrDeleteAuthenticationSchema = Joi.object({
    refreshToken: Joi.string().required()
})

module.exports = { PostAuthenticationSchema, PutOrDeleteAuthenticationSchema }