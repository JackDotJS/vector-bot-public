/**
 * VECTOR :: CUSTOM LOGGER
 */

const chalk = require(`chalk`);
const util = require(`util`);
const env = require(`./envmem.js`);

const getSrc = () => {
  const trace = new Error().stack;
  const match = trace.split(`\n`)[2].match(/(?<=at\s|\()([^(]*):(\d+):(\d+)\)?$/);

  if (match != null && match.length >= 4) {
    const file_name = match[1].replace(process.cwd(), `.`).replace(/\\/g, `/`);
    const line = match[2];
    const column = match[3];

    return `${file_name}:${line}:${column}`;
  }

  return;
};

module.exports = (content, level, file) => {
  if (process.send) {
    if (file == null) {
      const result = getSrc();

      if (result) file = result;
    }

    return process.send({
      t: `LOG`,
      c: {
        content,
        level,
        file
      }
    });
  }

  const now = new Date();
  const hh = now.getUTCHours().toString().padStart(2, `0`);
  const mm = now.getUTCMinutes().toString().padStart(2, `0`);
  const ss = now.getUTCSeconds().toString().padStart(2, `0`);
  const ms = now.getUTCMilliseconds().toString().padStart(3, `0`);

  const timestamp = {
    color: chalk.white,
    content: `${hh}:${mm}:${ss}.${ms}`
  };

  const file_path = {
    color: chalk.yellow,
    content: file
  };

  const log_level = {
    color: chalk.magenta,
    content: `DEBUG`
  };

  const message = {
    content,
    color: chalk.white
  };

  if (file == null) {
    const result = getSrc();

    if (result) file_path.content = result;
  }

  if (typeof level === `string`) {
    if ([`fatal`, `error`, `warn`, `info`].includes(level.toLowerCase())) {
      log_level.content = level.toUpperCase();
    }

    switch (level.toLowerCase()) {
      case `fatal`:
        log_level.color = chalk.inverse.bgRedBright;
        message.color = chalk.redBright;
        break;
      case `error`:
        log_level.color = chalk.red;
        message.color = chalk.red;
        break;
      case `warn`:
        log_level.color = chalk.yellowBright;
        message.color = chalk.yellowBright;
        break;
      case `info`:
        log_level.color = chalk.white;
        message.color = chalk.whiteBright;
        break;
      default:
        if (!env.debug) return;
    }
  }

  if (typeof content !== `string`) {
    message.color = chalk.yellowBright;
    if (content instanceof Error) {
      message.content = content.stack;
    } else if (Buffer.isBuffer(content)) {
      message.content = content.toString();
    } else {
      message.content = util.inspect(content, { getters: true, showHidden: true });
    }
  }

  const plain1 = `[${timestamp.content}] [${file_path.content}] [${log_level.content}] : `;
  const plain2 = message.content.replace(/\n/g, `\n${(` `.repeat(plain1.length))}`) + `\n`;

  const terminal1 = [
    timestamp.color(`[${timestamp.content}]`),
    file_path.color(`[${file_path.content}]`),
    log_level.color(`[${log_level.content}]`),
    `: `
  ].join(` `);
  const terminal2 = message.color(message.content.replace(/\n/g, `\n${(` `.repeat(plain1.length))}`));

  console.log(terminal1 + terminal2);
  if (env.log.stream) env.log.stream.write(plain1 + plain2);
};