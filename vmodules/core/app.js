/**
 * VECTOR :: CORE APP
 */

if (!process.send) throw new Error(`Cannot run standalone.`);

const djs = require(`discord.js`);
const util = require(`util`);
const Vector = require(`../classes/client.js`);
const log = require(`./log.js`);

const djs_opts = {
  presence: {
    status: `idle`,
    activity: {
      type: `WATCHING`,
      name: `assets load 🔄`
    }
  },
  disableMentions: `everyone`, // remove this line to die instantly
  intents: [
    djs.Intents.FLAGS.GUILDS,
    djs.Intents.FLAGS.GUILD_MESSAGES,
    djs.Intents.FLAGS.DIRECT_MESSAGES
  ]
};

const vec_opts = {
  debug: (process.argv[2] === `true`)
};

const bot = new Vector(djs_opts, vec_opts);

bot.login(bot.keys.discord).catch(err => {
  log(err, `fatal`);
  log(`Failed to connect to Discord API. Restarting in 5 minutes...`);

  // 5 minute timeout to give the API some time to be restored.
  // this is assuming the issue is on Discord's end.
  setTimeout(() => {
    process.exit(1);
  }, (1000 * 60 * 5));
});

// Bot Ready

bot.on(`ready`, () => {
  log(`Successfully connected to Discord API.`, `info`);
});