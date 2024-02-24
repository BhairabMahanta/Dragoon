const fs = require('fs');

const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'list',
	description: 'List keywords for a specific channel.',
	execute(client, message, args) {
		if (args.length !== 1) {
			return message.reply(`Usage: a!list <#channelmention>`);
		}

		const channelId = args[0].replace(/[<#>]/g, ''); // Extract channel ID from mention

		// Read current settings
		const settings = JSON.parse(fs.readFileSync('./commands/fun/watching.json', 'utf-8'));

		// Check if the channel exists in settings
		if (!settings.channels[channelId]) {
			return message.reply('This channel is not being watched. Use a!watchdog to activate it.');
		}

		// Check if the channel has a keywords array
		const keywords = settings.channels[channelId].keywords;

		if (!keywords || keywords.length === 0) {
			return message.reply('No keywords set for this channel.');
		}

		// Build embed with keywords
		const embed = new EmbedBuilder()
			.setTitle(`Keywords for <#${channelId}>`)
			.setDescription('List of keywords and their responses:')
			.setFields(
				keywords.map((keywordObj) => {
					const chanceee = keywordObj.chance ? keywordObj.chance : 100;
					const keywordda = keywordObj.keyword.join(', ');
					return {
						name: `**${keywordda} - ${chanceee}% chance**`,
						value: `> ${keywordObj.response}`,
						inline: false,
					};
				}),
			);

		return message.channel.send({ embeds: [embed] });
	},
};
