const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const ownerIds = ['537619455409127442', '169160763091451904', '99828960719806464'];
module.exports = {
	name: 'lb',
	description: 'Displays a leaderboard of roulette winners.',
	async execute(client, message, args) {
		let previousWinners;
		try {
			const data = fs.readFileSync('./commands/fun/previousWinners.json', 'utf8');
			previousWinners = JSON.parse(data);
		} catch (err) {
			console.error('Error reading previous winners data:', err);
		}
		if (!ownerIds.includes(message.author.id)) {
			return message.reply('angy bork');
		}
		//bang
		let leaderboardSize = Object.keys(previousWinners).length; // Default to all entries

		if (args.length > 0) {
			leaderboardSize = parseInt(args[0]); // Parse the argument as an integer

			if (isNaN(leaderboardSize) || leaderboardSize <= 0) {
				return message.reply('Please provide a valid number for the leaderboard size.');
			}
		}

		// Sort the previousWinners object by descending order of values (number of wins)
		const sortedWinners = Object.entries(previousWinners)
			.sort(([, winsA], [, winsB]) => winsB - winsA)
			.slice(0, leaderboardSize); // Take only the top X entries

		const embed = new EmbedBuilder()
			.setTitle(`Top ${leaderboardSize} Roulette Winners`)
			.setColor('#FFC700')
			.setDescription(
				sortedWinners.map(([userId, wins], index) => `${index + 1}. <@${userId}> - ${wins} wins`).join('\n'),
			);

		message.channel.send({ embeds: [embed] });
	},
};
