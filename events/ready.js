const logger = require('../logger')

module.exports = async (client) => {
  logger.info(`connected as ${client.user.username}#${client.user.discriminator} (${client.user.id})`, 'ready')

  try {
    await client.user.setActivity('Friends', { type: 'WATCHING' })
    logger.silly('presence updated')
  } catch (err) {
    logger.error(err.message, err)
  }
}
