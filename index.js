// const app = require('./app')
const http = require('http')
const logger = require('./utils/logger')
const config = require('./utils/config')
const app = require('./app')

const server = http.createServer(app)

const PORT = config.PORT
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})