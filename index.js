const Discord = require('discord.js')
const Enmap = require('enmap')
const path = require('path')
const fs = require('fs')

const logger = require('./logger')
const { loadCommand } = require('./util')

const client = new Discord.Client()

const { BOT_TOKEN: token } = process.env
const defaults = require('./default-settings.json')

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
  logger.debug(`registering event : ${eventName}`)
  client.on(eventName, eventHandler.bind(null, client))
}

const commandFiles = fs.readdirSync(path.resolve(__dirname, 'commands/'))

for (const file of commandFiles) {
  loadCommand(client, file)
}

client.login(client.config.token)

process.once('SIGINT', () => {
  logger.silly('killing client with sigint')
  client.destroy()
  if (client.chatter) {
    client.chatter.dataStream.close()
  }
})
