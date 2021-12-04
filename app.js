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
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const mongoUrl = config.MONGODB_URI
logger.info(`connecting to ${mongoUrl}`)
mongoose.connect(mongoUrl).then(response => console.log('connected to MongoDB'))
.catch(error => console.log('error connecting to MongoDB', error.message))
app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)
app.use('/api/login', loginRouter)
// app.use(middleware.tokenExtractor)
app.use('/api/users', usersRouter)
app.use('/api/blogs', middleware.userExtractor, notesRouter)
if (process.env.NODE_ENV='test') {
    const testingRouter = require('./controllers/testing')
    app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
module.exports = app
