  const config = require('./config.json');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, Events, ModalBuilder, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
const settings = require('./commands/fun/roulette.json');
const { monthlyIncrement, startRouletteOrOtherAction } = require('./commands/fun/someFunctions');
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ]

});


const Discord = require('discord.js');
const { loadCommands } = require('./handler');

// Create a new collection to store the commands
client.commands = new Collection();

// Load all the commands
loadCommands(client);



client.on('messageCreate', message => {
  try {
  if (message.content.startsWith('a!')) {
    const args = message.content.slice(2).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    console.log(`Received command: ${commandName}`);
// console.log('commandAlias:', client.commands)

   

    const command = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName.toLowerCase()));


    if (!command) return;

    try {
      console.log('Executing command:', command.name);
      command.execute(client, message, args);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while executing the command.');
    }
  }
    } catch (error) {
  console.log('what the fuck:', error)
}
});

client.on('ready', () => {
  console.log('client:', client.channels)
  console.log(`${client.user.tag} is ready!🚀`);
 
  client.user.setPresence({ activities: [{ name: 'Crowdslay is probably breaking something again!' }], status: 'online' });
}); //tells that bot is hot and on

client.on('messageCreate', async (message) => {
  // Check if the message is from a bot or not in a guild
  if (message.author.bot || !message.guild) return;

  // Load current settings
  const settings = require('./commands/fun/watching.json');

  // Check if the channel is being watched
  if (!settings.channels.hasOwnProperty(message.channel.id)) return;

  const channelId = message.channel.id;
  const channelData = settings.channels[channelId];

  // Check if the channel is enabled
  if (!channelData.stats.status) return;

  // Check if there are keywords for autoresponse
  if (channelData.keywords && channelData.keywords.length > 0) {
    let matchedKeyword = null;
    let messageContent = message.content.toLowerCase();

    // Iterate through each keyword
    channelData.keywords.forEach(keywordObj => {
      if (Array.isArray(keywordObj.keyword)) {
        // If keyword is an array, check if message content starts with any of the keywords
        keywordObj.keyword.forEach(keyword => {
          if (messageContent.startsWith(keyword.toLowerCase())) {
            matchedKeyword = keywordObj;
          }
        });
      } else {
        // If keyword is a single string, check if message content starts with it
        if (messageContent.startsWith(keywordObj.keyword.toLowerCase())) {
          matchedKeyword = keywordObj;
        }
      }
    });

    // If a matched keyword is found, send the autoresponse
    if (matchedKeyword) {
      const chanceNumber = matchedKeyword.chance || 100;
      console.log('chanceNumber', chanceNumber);
      const chance = (Math.random() < chanceNumber / 100);
      console.log('chance', chance);
      if (!chance) return;
      message.reply(matchedKeyword.response);
    }
  }
});






const interval = 10 * 1000;
setInterval(whoInterval, interval);
const BOT_PREFIX = "a!";

async function rouletteInit(channelId) {
    // Load current settings
     // Check if the channel is being watched
     let participants = [];
    if (!settings.channels.hasOwnProperty(channelId)) return;
  
    const channelData = settings.channels[channelId];
  const daHta = channelData.rouletteData
    // Check if rouletteData is defined for the channel
    if (!channelData.rouletteData) return;
  
   
    // Check if it's time to trigger a roulette game based on spawnChance and interval
    const shouldTrigger = Math.random() * 100 <= daHta.spawnChance;
    if (!shouldTrigger) return;
  
    // Create the initial embed
    const embed = new EmbedBuilder()
      .setTitle(`Roulette Game # ${daHta.monthly}!`)
      .setDescription(`React with the button ${daHta.emote}`)
      .addFields({ name: 'Participants', value: participants.length === 0 ? `None, aborting it if ${daHta.inactiveLimit} minutes cross without any participants!` : participants.join('\n'), inline: false})
      .addFields({ name:'Participant Limit', value: `${participants.length}/${daHta.participantLimit}`, inline: false });
  
    // Create the action row with the button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('join_roulette')
          .setLabel('Join Roulette')
          .setStyle('Primary')
      );

    // Send the initial embed with the button
    const sentMessage = await client.channels.cache.get(channelId).send({ embeds: [embed], components: [row] });
    // Create a message collector for the button
    const filter = i => (['join_roulette'].includes(i.customId)) || (i.customId === 'option_select');
    const collector = sentMessage.createMessageComponentCollector({ filter, time:daHta.inactiveLimit });
  
    // Event listener for the button click
    collector.on('collect', async interaction => {
      try {
      // Check if the user is already a participant
      interaction.deferUpdate();
    
      if (!participants.includes(interaction.user.id)) {
        // Add the user to the participants list
        participants.push(interaction.user.id);
        // Update the embed with the new participant
        var users = [] 
        users.push(interaction.user.username);

        embed.data.fields[0].value = users.join('\n');
        embed.data.fields[1].value = `${participants.length}/${daHta.participantLimit}`;
        // Update the message with the new embed
        await sentMessage.edit({ embeds: [embed], components: [row] });
      } else     // if (interaction.customId === 'join_roulette') {
        if (participants.includes(interaction.user.id)) {
          sentMessage.channel.send({ content: 'You have a deathwish trying to participate multiple times!?', ephemeral: true });
        // }
        }
      // Check if the participant limit or the inactive limit is reached
      if (participants.length >= daHta.participantLimit || collector.time >= daHta.inactiveLimit || participants.length >= daHta.minimumParticipants) {
await startRouletteOrOtherAction(participants, daHta, embed, sentMessage, users);
      }
    } catch (error) {
      console.log('error (i think someone spamming the button', error);
    }
    });
  
    // Event listener for the collector end
    collector.on('end', async () => {
      // Your logic when the collector ends
    });
  
  };



async function whoInterval() {

  // Iterate through each channel in settings
  for (const channelId in settings.channels) {
    console.log('channelId', channelId);
    const channelData = settings.channels[channelId];
    const rouletteData = channelData.rouletteData;

    // Check if rouletteData is defined for the channel
    if (!rouletteData) continue;

    // Check if it's time to trigger a roulette game based on spawnChance
    const shouldTrigger = Math.random() * 100 <= rouletteData.spawnChance;
    if (shouldTrigger) {
      // Call the rouletteInit function with channel ID
        await monthlyIncrement(channelId);
      await rouletteInit(channelId, rouletteData);
      
    }
  }
}

client.login(config.token);
                                                                                                                                  