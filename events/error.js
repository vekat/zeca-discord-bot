module.exports = (client, err) => {
  client.logger.error(err.message, err.stack || err.error)
}
