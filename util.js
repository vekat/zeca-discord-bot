const logger = require('./logger')

const util = exports

/**
 * Default command metadata.
 */
util.commandMeta = {
  'level': 0,
  'usage': '',
  'aliases': [],
  'hidden': true,
  'category': 'none',
  'description': 'none'
}

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
 * Loads a command file.
 * @param {Client} client
 * @param {string} file
 */
util.loadCommand = (client, file) => {
  logger.silly(`loading command file : ${file}`)
  if (!file.endsWith('.js')) {
    logger.silly('invalid file')
    return false
  }

  const command = require(`./commands/${file}`)
  command.meta = {
    ...util.commandMeta,
    name: file.split('.')[0],
    ...command.meta,
    file: file
  }

  const { name, aliases } = command.meta
  aliases.forEach((alias) => {
    client.aliases.set(alias, name)
  })
  client.commands.set(name, command)

  logger.debug(`loaded command : ${name} (${file})`)
  return true
}

/**
 * Unloads a command.
 * @param {Client} client
 * @param {string} cmdName
 */
util.unloadCommand = (client, cmdName) => {
  logger.silly(`unloading command : ${cmdName}`)
  const command = client.commands.get(cmdName) || client.commands.get(client.aliases.get(cmdName))
  if (!command) {
    logger.silly(`command '${cmdName}' does not exist`)
    return [false, null]
  }

  const { file, name } = command.meta
  delete require.cache[require.resolve(`./commands/${file}`)]
  client.commands.delete(name)

  logger.debug(`unloaded command : ${cmdName}`)
  return [true, file]
}

/**
 * Async timeout.
 */
util.timeout = function timeout (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

util.handleError = async function handleError (ctx, next) {
  try {
    await next()
  } catch (err) {
    ctx.throw(err)
  }
}

util.validateArgs = async function validateArgs (ctx, next) {
  const { minargs = 0, maxargs = 20 } = ctx.meta

  const len = ctx.args.length
  if (len >= minargs && len <= maxargs) {
    return next()
  } else {
    ctx.log('wrong amount of arguments')
    ctx.writeUsage()
  }
}

const permissions = {
  'owner': 4,
  'admin': 3,
  'mod': 2,
  'member': 1
}

util.requirePermission = function (level) {
  if (typeof level === 'string') {
    level = permissions[level] || 0
  }

  return async function requirePermission (ctx, next) {
    if (ctx.permission < level) {
      ctx.writeErr('you do not have the permission to do this')
    } else {
      next()
    }
  }
}

/**
 * Creates a new array with all array elements concatenated into it.
 * @param {any[]} input Input array
 * @returns {any[]} New flattened array.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat}
 */
util.flatten = function flatten (input) {
  const stack = [...input]
  const res = []
  while (stack.length) {
    // pop value from stack
    const next = stack.pop()
    if (Array.isArray(next)) {
      // push back array items, won't modify the original input
      stack.push(...next)
    } else {
      res.push(next)
    }
  }
  // reverse to restore input order
  return res.reverse()
}

util.chain = function chain (...fns) {
  fns = util.flatten(fns)

  for (const fn of fns) {
    if (typeof fn !== 'function') {
      throw new Error('input must only contain functions')
    }
  }

  return function run (context, next) {
    let lastIndex = -1
    function dispatch (index) {
      if (index <= lastIndex) return Promise.reject(new Error('next() called multiple times'))
      lastIndex = index
      let fn = fns[index]
      if (index === fns.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, index + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}
