  const { EmbedBuilder } = require('discord.js');
  const fs = require('fs');
  const ownerIds  = ['537619455409127442', '169160763091451904', '99828960719806464'];
  const settings = require('./roulette.json');
      let itWorked= false;    
  module.exports = {
    name: 'roulettedog',
    description: 'Set up a roulette game in a specific channel.',
    execute(client, message, args) {
      try{
  if (!ownerIds.includes(message.author.id)) {
        return message.reply('You do not have permission to use this command.');
      }
      if (args.length < 4) {
        return message.reply('Usage: c!roulettedog #channelId <spawnchance> <interval> <emote> <participantLimit> <killLimit> <minimumParticipants> <inactiveLimit> ');
      }

          const channelId = args[0].replace(/[<#>]/g, ''); // Extract channel ID from mention
  
      if (!channelId) {
        return message.reply('Please mention a valid channel.');
      }

      const spawnChance = parseFloat(args[1]);
      const interval = parseInt(args[2]);
      const emote = args[3];
      const pLimit = parseInt(args[4]);
      const kLimit = parseInt(args[5]);
      const mLimit = parseInt(args[6]);
      const iLimit = parseInt(args[7]);


      if (isNaN(spawnChance) || spawnChance <= 0 || spawnChance > 100) {
        return message.reply('Spawn chance must be a number between 0 and 100.');
      }

      if (isNaN(interval) || interval <= 0) {
        return message.reply('Interval must be a positive number.');
      }
      if (isNaN(pLimit) || pLimit <= 0) {
          return message.reply('Participant limit must be a positive number.');
          }
      if (isNaN(kLimit) || kLimit <= 0) {
          return message.reply('Kill limit must be a positive number.');
          }
      if (isNaN(mLimit) || mLimit <= 0) {
          return message.reply('Minimum participants must be a positive number.');
          }
      if (isNaN(iLimit) || iLimit <= 0) {
          return message.reply('Inactive limit must be a positive number.');
          }
  // Load current settings


  // Check if channel already exists in settings
  const channelData = settings.channels[channelId];

  // Update settings
      const rouletteData = {
        spawnChance: spawnChance,
        interval: interval * 60000,
  // Convert to milliseconds
        emote: emote,
        participants: [],
        participantLimit : pLimit,
        killLimit : kLimit,
        minimumParticipants: mLimit,
        inactiveLimit: iLimit * 60000,
        monthly: 0
      };
      itWorked = true;
      
      if (!channelData) {
          settings.channels[channelId] = { rouletteData };
        } else {
    return message.reply('This channel is already being watched. Edit it manually or bug me :p');
  }
  // Save updated settings
      const rouletteJSON = './commands/fun/roulette.json';
      if (itWorked === true) {
      // Save roulette data to JSON file
      fs.writeFileSync(rouletteJSON, JSON.stringify(settings, null, 2));
      }
      return message.reply(`Roulette game set up in <#${channelId}> with spawn chance ${spawnChance}%, interval ${interval} minutes, with emoji ${emote}. The game will end when ${kLimit} people die, or when ${iLimit} minutes pass without ${mLimit} participants.`);
      }catch(e){
        console.error(e);
        return message.reply(`Usage: c!roulettedog #channelId <spawnchance> <interval> <emote> <participantLimit> <killLimit> <minimumParticipants> <inactiveLimit>`);
      }  
  },
  };