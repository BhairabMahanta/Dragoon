const fs = require('fs');
const ownerIds  = ['537619455409127442', '169160763091451904', '99828960719806464'];

module.exports = {
  name: 'watchdog',
  description: 'Activate/deactivate watchdog for a specific channel.',
  execute(client, message, args) {
    let itWorked = false;
    // Check if the command is executed by the bot owner
    if (!ownerIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    const fs = require('fs');

    if (args.length !== 2 || (args[1] !== 'on' && args[1] !== 'off')) {
      return message.reply(`Usage: a!watchdog <#channelmention> (on/off)`);
    }

    const channelId = args[0].replace(/[<#>]/g, ''); // Extract channel ID from mention
    let status = args[1];
    if (status === 'on') {
      status = true;
    } else {
      status = false;
    }

    // Load current settings
    const settings = require('./watching.json');

    // Check if channel already exists in settings
    const channelData = settings.channels[channelId];

    if (channelData && channelData.stats && channelData.stats.status === status) {
      return message.reply('This channel is already being watched.');
    }

    // Update settings
    itWorked = true;
    if (channelData) {
      channelData.stats = { status };
    } else {
      settings.channels[channelId] = { stats: { status } };
    }
    // Save updated settings
    if (itWorked === true) {
      fs.writeFileSync('./commands/fun/watching.json', JSON.stringify(settings, null, 2));
    }
    const action = status === true ? 'activated' : 'deactivated';

    return message.reply(`Watchdog ${action} for <#${channelId}>`);
  },
};