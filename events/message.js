const { getPermission } = require('../util')

module.exports = async (client, message) => {
  if (!message.guild || !message.guild.available) {
    return client.logger.silly('rejected message without guild')
  }
  if (message.author.bot || message.system) {
    return client.logger.silly('rejected message without member')
  }

  if (!client.settings.has(message.guild.id)) {
    client.settings.set(message.guild.id, {})
  }

  const { defaults } = client.config
  const guilds = client.settings.get(message.guild.id)

  const settings = message.settings = { ...defaults, ...guilds }

  if (!message.content.startsWith(settings.prefix)) {
    const mentions = new RegExp(`<@!?${client.user.id}>`, 'g')

    if (mentions.test(message.content)) {
      message.content = `${settings.prefix} prefix`
    } else {
      return client.logger.silly('rejected message without prefix')
    }
  }

  const args = message.content.slice(settings.prefix.length).trim().split(/\p{White_Space}+/ug)
  const cmdName = args.shift().toLowerCase()

  const command = client.commands.get(cmdName) || client.commands.get(client.aliases.get(cmdName))

  if (!command) {
    return client.logger.info(`user '${message.author}' called non-command '${cmdName}'`)
  }

  const permission = getPermission(message, settings)

  client.logger.debug(`user '${message.author}' (${permission}) called command '${command.meta.name}' (${command.meta.level}) with ${args.length} args`)

  return command.run(client, message, args, permission)
}
