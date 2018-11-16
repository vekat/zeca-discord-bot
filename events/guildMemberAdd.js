const Discord = require('discord.js')
const { timeout } = require('../util')

module.exports = async (client, member) => {
  await timeout(5 * 1000)

  if (member.deleted) {
    return client.logger.silly('member left guild before filter')
  }

  const url = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi

  if (url.test(member.user.username) || url.test(member.displayName)) {
    return member.kick(`[zeca] username contains url`)
      .then(() => client.logger.debug('member kicked with filter'))
      .catch(client.logger.error)
  }

  const guild = member.guild
  if (!client.newcomers.has(guild.id)) {
    client.newcomers.set(guild.id, new Discord.Collection())
  }

  const newcomers = client.newcomers.get(guild.id)
  client.logger.debug('adding newcomer')
  newcomers.set(member.id, member.user)

  client.setTimeout(() => {
    if (newcomers.has(member.id)) {
      newcomers.delete(member.id)
      guild.channels.find((c) => c.name === 'bem-vindo').send(`welcome ${member.toString()}`)
    }
  }, 60 * 1000)
}
