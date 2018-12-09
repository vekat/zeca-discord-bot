const logger = require('../logger')

module.exports = (client, err) => {
  logger.error(err.message, err.stack || err.error)
}
