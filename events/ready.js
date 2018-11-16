module.exports = async (client) => {
  client.logger.info(`connected as ${client.user.username}#${client.user.discriminator} (${client.user.id})`, 'ready')

  try {
    await client.user.setActivity('Friends', { type: 'WATCHING' })
    client.logger.silly('presence updated')
  } catch (err) {
    client.logger.error(err.message, err)
  }
}
