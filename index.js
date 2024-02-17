const config = require('./config.json');
const {
	Client,
	IntentsBitField,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	SlashCommandBuilder,
	Events,
	ModalBuilder,
	Collection,
} = require('discord.js');
const path = require('path');
const fs = require('fs');
const { RouletteGame } = require('./commands/fun/rouletteClass');
const settings = require('./commands/fun/roulette.json');
const { monthlyIncrement, startRouletteOrOtherAction } = require('./commands/fun/someFunctions');
const client = new Client({
	intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent],
});

const Discord = require('discord.js');
const { loadCommands } = require('./handler');

// Create a new collection to store the commands
client.commands = new Collection();

// Load all the commands
loadCommands(client);

client.on('messageCreate', (message) => {
	try {
		if (message.content.startsWith('a!')) {
			const args = message.content.slice(2).trim().split(/ +/);
			const commandName = args.shift().toLowerCase();
			console.log(`Received command: ${commandName}`);
			// console.log('commandAlias:', client.commands)

			const command =
				client.commands.get(commandName) ||
				client.commands.find((c) => c.aliases && c.aliases.includes(commandName.toLowerCase()));

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
		console.log('what the fuck:', error);
	}
});

client.on('ready', () => {
	console.log('client:', client.channels);
	console.log(`${client.user.tag} is ready!🚀`);

	client.user.setPresence({
		activities: [{ name: 'Crowdslay is probably breaking something again!' }],
		status: 'online',
	});
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
		channelData.keywords.forEach((keywordObj) => {
			if (Array.isArray(keywordObj.keyword)) {
				// If keyword is an array, check if message content starts with any of the keywords
				keywordObj.keyword.forEach((keyword) => {
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
			const chance = Math.random() < chanceNumber / 100;
			console.log('chance', chance);
			if (!chance) return;
			message.reply(matchedKeyword.response);
		}
	}
});
const BOT_PREFIX = 'a!';

for (const channelId in settings.channels) {
	console.log('channelId', channelId);
	const channelData = settings.channels[channelId];
	console.log('channelData', channelData.rouletteData.channelId);
	if (channelData.rouletteData.channelId === channelId) {
		const rouletteData = channelData.rouletteData;
		const interval = rouletteData.interval;
		console.log('interval', interval);
		setInterval(() => {
			whoInterval(channelId); // Call the function inside the setInterval callback
		}, interval);
	}
}
async function whoInterval(channelId) {
	console.log('channelId2', channelId);
	const roulettegame = new RouletteGame(channelId, settings, client);
	roulettegame.start();
	const channelData = settings.channels[channelId];
	const rouletteData = channelData.rouletteData;

	// Check if rouletteData is defined for the channel
	// Check if it's time to trigger a roulette game based on spawnChance
	const shouldTrigger = Math.random() * 100 <= rouletteData.spawnChance;
	if (shouldTrigger) {
		// Call the rouletteInit function with channel ID
		await monthlyIncrement(channelId);
		// await rouletteInit(channelId, rouletteData);
	}
}

client.login(config.token);
