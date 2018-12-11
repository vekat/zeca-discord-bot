const util = exports

/**
 * Regular expression to match URLs.
 */
util.urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi

/**
 * Fetches the permission level from a member's message.
 * @param {Message} message discord message
 * @param {object} settings guild settings
 * @returns Permission level
 */
util.getPermission = function getPermission (message, settings) {
  if (message.author.id === message.guild.ownerID) return 4
  if (message.member.roles.some((r) => settings.administratorRoles.includes(r.name))) return 3
  if (message.member.roles.some((r) => settings.moderatorRoles.includes(r.name))) return 2
  if (message.member.roles.some((r) => settings.memberRoles.includes(r.name))) return 1
  return 0
}

/**
 * Fetches the settings for a given guild.
 * @param {Client} client
 * @param {number} guildId
 * @returns {object} Settings object
 */
util.getSettings = function getSettings (client, guildId) {
  if (!client.settings.has(guildId)) {
    client.settings.set(guildId, {})
  }

  const { defaults } = client.config
  const guildOverrides = client.settings.get(guildId)

  return { ...defaults, ...guildOverrides }
}

/**
 * Async timeout.
 */
util.timeout = function timeout (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
