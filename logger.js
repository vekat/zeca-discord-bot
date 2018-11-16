const winston = require('winston')

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'warn' }),
    new winston.transports.File({ filename: 'debug.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
    level: 'debug'
  }))
}

module.exports = logger
