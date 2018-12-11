const Discord = require('discord.js')

const logger = require('../logger')
const { urlRegex: url, timeout, getSettings } = require('../util')

module.exports = async (client, member) => {
  await timeout(5 * 1000)

  if (member.deleted) {
    return logger.silly('member left guild before filter')
  }

  const guild = member.guild
  const settings = getSettings(client, guild.id)

  let logs = settings.loggingChannel
  if (typeof logs === 'string') {
    if (guild.channels.has(logs)) {
      logs = guild.channels.get(logs)
    } else {
      logs = guild.channels.find((c) => c.name === logs)
    }
  } else { logs = null }

  let welcome = settings.welcomeChannel
  if (typeof welcome === 'string') {
    if (guild.channels.has(welcome)) {
      welcome = guild.channels.get(welcome)
    } else {
      welcome = guild.channels.find((c) => c.name === welcome)
    }
  } else { welcome = null }

  if (url.test(member.user.username) || url.test(member.displayName)) {
    const { id } = member
    const msg = `url filter : kicked member \`${id}\``
    return member.kick(`[zeca] username contains url`)
      .then(() => logs ? logs.send(msg) : null)
      .then(() => logger.debug(msg))
      .catch(logger.error)
  }

  if (welcome) {
    logger.silly('should welcome user soon')
    const msg = (settings.welcomeMessage || 'welcome {member}')
      .replace(/\{member\}/gi, `${member}`)

    if (!client.newcomers.has(guild.id)) {
      client.newcomers.set(guild.id, new Discord.Collection())
    }

    const newcomers = client.newcomers.get(guild.id)
    logger.silly('adding newcomer')
    newcomers.set(member.id, member.user)

    client.setTimeout(() => {
      if (newcomers.has(member.id)) {
        newcomers.delete(member.id)
        welcome.send(msg)
      }
    }, 60 * 1000)
  }
}
