const logger = require('../logger')

module.exports = (client, member) => {
  const guild = member.guild
  const newcomers = client.newcomers.get(guild.id)
  if (!newcomers) return
  if (newcomers.has(member.id)) {
    logger.debug('removing newcomer', member.toString())
    newcomers.delete(member.id)
  }
}
