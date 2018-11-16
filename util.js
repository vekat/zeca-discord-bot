/**
 * Fetches the permission level from a member's message.
 * @param {Message} message discord message
 * @param {object} settings guild settings
 * @returns Permission level
 */
exports.getPermission = function getPermission (message, settings) {
  if (message.author.id === message.guild.ownerID) return 4
  if (message.member.roles.some((r) => settings.administratorRoles.includes(r.name))) return 3
  if (message.member.roles.some((r) => settings.moderatorRoles.includes(r.name))) return 2
  if (message.member.roles.some((r) => settings.memberRoles.includes(r.name))) return 1
  return 0
}

/**
 * Async timeout.
 */
exports.timeout = function timeout (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
