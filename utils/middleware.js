const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
    const authHeader = request.get('authorization')
    if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
        request.body.token = authHeader.substring(7)
    }
    next()
}
const userExtractor = async (request, response, next) => {
    const authHeader = request.get('Authorization')
    if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
        const tokenSent = authHeader.substring(7)
        const decodedToken = jwt.verify(tokenSent, process.env.SECRET)
        if (!tokenSent || !decodedToken.id) {
            response.status(401).json({ error: 'missing or invalid token' })
        }
        console.log(decodedToken.id)
        console.log(await User.findById("61864a897a8f87221123e5b7"))   
        const userForToken = await User.findById(decodedToken.id)
        console.log(userForToken)
        request.body.user = userForToken
    }
    next()
}
const requestLogger = (request, response, next) => {
    logger.info('Method:  ', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).send({ error: 'invalid token'})
    }
    next(error)
}


module.exports = {
    tokenExtractor,
    userExtractor,
    requestLogger,
    unknownEndpoint,
    errorHandler
}