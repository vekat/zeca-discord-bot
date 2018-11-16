const Discord = require('discord.js')
const Enmap = require('enmap')
const path = require('path')
const fs = require('fs')

const client = new Discord.Client()

const { BOT_TOKEN: token } = process.env
const defaults = require('./default-settings.json')
const basemeta = require('./default-command.json')

client.logger = require('./logger')
client.config = { token, defaults }
client.settings = new Enmap({ name: 'settings' })

client.commands = new Enmap()
client.aliases = new Enmap()
client.newcomers = new Enmap()

const eventFiles = fs.readdirSync(path.resolve(__dirname, 'events/'))

for (let file of eventFiles) {
  if (!file.endsWith('.js')) continue
  const eventName = file.split('.')[0]
  const eventHandler = require(`./events/${file}`)
  client.logger.info(`registering event : ${eventName}`)
  client.on(eventName, eventHandler.bind(null, client))
}

const commandFiles = fs.readdirSync(path.resolve(__dirname, 'commands/'))

for (const file of commandFiles) {
  if (!file.endsWith('.js')) continue
  const command = require(`./commands/${file}`)
  command.meta = {
    ...basemeta,
    name: file.split('.')[0],
    ...command.meta
  }
  const commandName = command.meta.name
  command.meta.aliases.forEach((alias) => {
    client.aliases.set(alias, commandName)
  })
  client.logger.info(`loading command : ${commandName}`)
  client.commands.set(commandName, command)
}

client.login(client.config.token)

process.once('SIGINT', () => {
  client.logger.info('killing', 'sigint')
  client.destroy()
  if (client.chatter) {
    client.chatter.dataStream.close()
  }
})