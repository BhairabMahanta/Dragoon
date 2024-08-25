const { ChannelType } = require('discord.js');
const { getUserConfig } = require('./databaseHandler');
const constants = require('./constants');
const fs = require('fs');
const { client } = require('../index');

let reminderType = {
	fish: 30000, // 5 minutes for fishing
};

let reminders = {};

module.exports = (message, userId, type) => {
	if (reminders[userId + type]) clearTimeout(reminders[userId + type].timeout);

	let reminder = setTimeout(async () => {
		let reminderConfig = await getUserConfig(`reminders.${type}`, userId, message.guildId);
		if (!reminderConfig.data) return;

		try {
			if (message.channel.type === ChannelType.DM) return;

			let isDm = reminderConfig.data === 'dm';
			let perms = message.guild?.members.me?.permissionsIn(message.channel);

			if (perms?.has('SendMessages') || isDm) {
				let sendChannel = isDm ? message.author : message.channel;
				let isDmMessage = isDm ? ` <#${message.channelId}>` : '';

				sendChannel
					.send(`${constants.REMINDER_EMOJI} <@${userId}> You can now **${type}**!${isDmMessage}`)
					.catch(() => null);
			}
		} catch (err) {
			console.error('Error sending reminder:', err);
		}
	}, reminderType[type]);

	reminders[userId + type] = {
		timeout: reminder,
		userId,
		type,
		startTime: Date.now(),
		channelId: message.channelId,
		guildId: message.guildId,
	};
};

function saveReminders() {
	try {
		fs.writeFileSync(
			'./reminders.json',
			JSON.stringify(
				Object.values(reminders).map((reminder) => {
					return {
						userId: reminder.userId,
						type: reminder.type,
						startTime: reminder.startTime,
						channelId: reminder.channelId,
						guildId: reminder.guildId,
					};
				}),
			),
		);
	} catch (e) {
		console.error('Error saving reminders:', e);
	}
}

function loadReminders() {
	let file = fs.readFileSync('./reminders.json');
	if (!file) return;

	let data = JSON.parse(file.toString());
	data.forEach((reminder) => {
		let time = reminderType[reminder.type] - (Date.now() - reminder.startTime);
		if (time < 1) return;

		let timeout = setTimeout(async () => {
			let reminderConfig = await getUserConfig(`reminders.${reminder.type}`, reminder.userId, reminder.guildId);
			if (!reminderConfig.data) return;

			try {
				let isDm = reminderConfig.data === 'dm';
				let channel = await client.channels.fetch(reminder.channelId);
				const user = await client.users.fetch(reminder.userId);

				if (!channel) {
					if (isDm) {
						user
							?.send(
								`${constants.REMINDER_EMOJI} <@${reminder.userId}> You can now **${reminder.type}**!  <#${reminder.channelId}>`,
							)
							.catch(() => null);
					}
					return;
				}

				if (channel.isDMBased()) return;
				let perms = (await client.guilds.fetch(reminder.guildId))?.members.me?.permissionsIn(channel);

				if (perms?.has('SendMessages') || isDm) {
					channel
						.send(
							`${constants.REMINDER_EMOJI} <@${reminder.userId}> You can now **${reminder.type}**!${
								isDm ? ` <#${reminder.channelId}>` : ''
							}`,
						)
						.catch(() => null);
				}
			} catch (err) {
				console.error('Error sending reminder:', err);
			}
		}, time);

		reminders[reminder.userId + reminder.type] = {
			timeout,
			userId: reminder.userId,
			type: reminder.type,
			startTime: reminder.startTime,
			channelId: reminder.channelId,
			guildId: reminder.guildId,
		};
	});
}

module.exports.saveReminders = saveReminders;
module.exports.loadReminders = loadReminders;
