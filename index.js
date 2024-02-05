  const config = require('./config.json');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, Events, ModalBuilder, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');


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
  console.log(channelId)
  const channelData = settings.channels[channelId];
  console.log(channelData)
   if (channelData.stats.status === false) return;
// console.log('true'  )
  // Check if there are keywords for autoresponse
  if (channelData.keywords && channelData.keywords.length > 0) {
    // Check if the message starts with any keyword
    const keywordData = channelData.keywords.find(kw => message.content.toLowerCase().startsWith(kw.keyword));
    console.log('true')
    // If a keyword is found, send the autoresponse
    if (keywordData) {
      console.log('true')
      message.reply(keywordData.response);
    }
  }
});

const BOT_PREFIX = "a!";








client.login(config.token);
                                                                                                                                  