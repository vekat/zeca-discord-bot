exports.run = async (client, message, args, level) => {
  if (!args || args.length === 0) {
    return message.channel.send(`my current prefix is \`${message.settings.prefix}\``)
  }

  if (level < 2) {
    return message.channel.send('access denied')
  }

  const prefix = args[0]

  client.settings.set(message.guild.id, prefix, 'prefix')

  return message.channel.send(`prefix set to \`${prefix}\``)
}

exports.meta = {
  hidden: false,
  name: 'prefix',
  category: 'guild',
  description: 'shows bot prefix',
  usage: '[prefix]',
  aliases: ['p'],
  level: 0
}
