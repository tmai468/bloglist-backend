// const app = require('./app')
const logger = require('./utils/logger')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const notesRouter = require('./controllers/blogs')

const mongoUrl = config.MONGODB_URI
logger.info(`connecting to ${mongoUrl}`)
mongoose.connect(mongoUrl).then(() => logger.info('connected to MongoDB'))
.catch(error => logger.error('error connecting to MongoDB', error.message))
app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)
app.use('/api/blogs', notesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
module.exports = app
