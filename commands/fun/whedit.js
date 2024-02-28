const { EmbedBuilder } = require('discord.js');
const ownerIds = ['537619455409127442', '169160763091451904', '99828960719806464'];
const { WebhookClient } = require('discord.js');

module.exports = {
	name: 'edit',
	description: 'Edits the image of an embed in a message sent by a webhook.',
	async execute(client, message, args) {
		if (!ownerIds.includes(message.author.id)) {
			return message.reply('You do not have permission to use this command.');
		}
		if (args.length !== 3) {
			return message.reply('Please provide the webhook URL, message ID, and image URL as arguments.');
		}

		const [webhookURL, messageID, imageURL] = args;

		// Create a new WebhookClient
		const webhook = new WebhookClient({ url: webhookURL });

		try {
			const originalMessage = await webhook.fetchMessage(messageID);
			const existingEmbed = originalMessage.embeds[0];

			// Create a new embed with the same properties as the existing one
			const newEmbed = new EmbedBuilder(existingEmbed);

			// Update only the image URL in the new embed
			newEmbed.setImage(imageURL);

			// Edit the original message with the modified embed
			await webhook.editMessage(originalMessage, {
				embeds: [newEmbed],
			});

			message.reply('Embed message edited successfully!');
		} catch (error) {
			console.error('Error editing webhook embed image:', error);
			message.reply('An error occurred while editing the webhook embed image.');
		} finally {
			// Destroy the WebhookClient to avoid memory leaks
			webhook.destroy();
		}
	},
};
