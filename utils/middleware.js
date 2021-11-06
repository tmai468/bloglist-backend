const logger = require('./logger')

const tokenExtractor = (request, response, next) => {
    const authHeader = request.get('authorization')
    if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
        request.body.token = authHeader.substring(7)
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
    requestLogger,
    unknownEndpoint,
    errorHandler
}