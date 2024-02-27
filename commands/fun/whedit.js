const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

const { WebhookClient, GatewayIntentBits } = require('discord.js');

module.exports = {
	name: 'webook',
	description: 'Displays a list of available commands and their descriptions.',
	async execute(client, message, args) {
		// Replace 'YOUR_WEBHOOK_URL' with your actual webhook URL crowd
		const webhookURL =
			'https://discord.com/api/webhooks/1200168986294366379/eYE1Ijkk1oQhvm1Br32pjFRYpLgIsNoMEjyL7XB4zt_MOGqRgEOiFJGJIIooKeIe3JfP';

		// Create a new WebhookClient
		const webhook = new WebhookClient({ url: webhookURL });
		try {
			const newImageURL =
				'https://cdn.discordapp.com/attachments/1162906838690431115/1200160506632224829/gaming_banner.png?ex=65c52b92&is=65b2b692&hm=11f2a63af007db5a3275f5a616a0e27ccc80bc69ec059b9f689c5ca04548cb8e&';
			const originalMessage = await webhook.fetchMessage('1212115413287313498');
			const existingEmbed = originalMessage.embeds[0];

			// Create a new embed with the same properties as the existing one
			const newEmbed = new EmbedBuilder(existingEmbed);

			// Update only the image URL in the new embed
			newEmbed.setImage(
				'https://cdn.discordapp.com/attachments/1162906838690431115/1200160506632224829/gaming_banner.png?ex=65c52b92&is=65b2b692&hm=11f2a63af007db5a3275f5a616a0e27ccc80bc69ec059b9f689c5ca04548cb8e&',
			);

			// Edit the original message with the modified embed
			await webhook.editMessage(originalMessage, {
				embeds: [newEmbed],
			});

			message.reply('Embed message edited successfully!');
		} catch (error) {
			console.error('Error sending/editing webhook embed message:', error);
			message.reply('An error occurred while sending/editing the webhook embed message.');
		} finally {
			// Destroy the WebhookClient to avoid memory leaks
			webhook.destroy();
		}
	},
};
