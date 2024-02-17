const settings = require('./roulette.json');
const { request } = require('undici');
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
	AttachmentBuilder,
} = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises; // Import fs.promises for asynchronous file
const efs = require('fs');
const Canvas = require('@napi-rs/canvas');
const sharp = require('sharp');
const axios = require('axios');
const canvas = Canvas.createCanvas(1440, 720);
const background = './commands/fun/crowdddd.png';
const fetch = require('node-fetch');
const Jimp = require('jimp'); // For mask creation
let attachment;

const path = require('path');

// Define the directory where you want to save the avatar image

// Define a function to handle starting the roulette game or taking other actions
async function startRouletteOrOtherAction(participants, daHta, sentMessage, users, client) {
	pewChannel = client.channels.cache.get('1207557983903416340');
	console.log('pewChannel:', pewChannel);
	// Check if the participant limit or the inactive limit is reached
	console.log('startRouletteOrOtherAction');
	let winnerArray = [];
	let winnerNameArray = [];
	// Perform the roulette game logic or other actions here
	console.log('killLimit:', daHta.killLimit);
	for (let i = 0; i < daHta.killLimit && participants.length >= 1; i++) {
		const winnerIndex = Math.floor(Math.random() * participants.length); // Randomly select a winner
		console.log('winnerIndex:', winnerIndex);
		console.log('participants:', participants);
		winnerArray.push(participants[winnerIndex]);
		console.log('winnerArray:', winnerArray);
		console.log('users:', users);
		winnerNameArray.push(users[winnerIndex]);
		console.log('winnerArray:', winnerNameArray);
		// const winnerUser = await client.users.fetch(winner);
		participants.splice(winnerIndex, 1); // Remove the winner from the participants array
		console.log(`Participant ${winnerArray.join(',')} eliminated`);
	}

	const winner1 = winnerArray[0];
	const pfp = await fetchUserPfp(winner1, client);
	console.log('test');
	let resizedImage;
	try {
		resizedImage = await sharp(pfp)
			.rotate(-2, { background: 'transparent' })
			.resize(117, 117, { fit: sharp.fit.inside }) // Resize proportionally
			.toBuffer();
	} catch (error) {
		console.error('Error resizing image:', error);
		return sentMessage.channel.send({ content: 'Error resizing image' });
	}
	const circleSize = 100; // Adjust the size of the circle as needed
	const circleX = 995; // Adjust the X position of the circle
	const circleY = 180; // Adjust the Y position of the circle

	// Create a new canvas for the circular mask
	const canvas = Canvas.createCanvas(circleSize, circleSize);
	const ctx = canvas.getContext('2d');

	// Draw a filled circle on the canvas
	ctx.beginPath();
	ctx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fillStyle = '#ffffff'; // Fill color (white)
	ctx.fill();

	// Convert the canvas to a PNG buffer
	const circularMaskBuffer = canvas.toBuffer('image/png');

	// Apply the circular mask to the resized image
	const circularImageBuffer = await sharp(resizedImage)
		.composite([{ input: circularMaskBuffer, blend: 'dest-in' }]) // Apply circular mask
		.png() // Convert the image to PNG format
		.toBuffer();

	// Composite the circular image onto the background
	const compositeImageBuffer = await sharp(background)
		.composite([{ input: circularImageBuffer, left: circleX, top: circleY }])
		.png()
		.toBuffer();
	console.log('test');

	const text = winnerNameArray[0];
	const textCanvas = Canvas.createCanvas(1440, 720); // Adjust dimensions as needed
	const textCtx = textCanvas.getContext('2d');

	// Set font properties
	textCtx.font = '24px Arial';
	textCtx.fillStyle = 'black';
	textCtx.textAlign = 'center';
	textCtx.textBaseline = 'middle';
	const textX = circleX + 67;
	const textY = circleY + 140;

	// Rotate around the text position
	textCtx.translate(textX, textY); // Translate to the center of the text
	textCtx.rotate((-4 * Math.PI) / 180);
	textCtx.translate(-textX, -textY); // Translate back to the original position

	// Draw the text on the text canvas
	textCtx.fillText(text, textX, textY);

	// Convert the text canvas to a buffer
	const textBuffer = textCanvas.toBuffer('image/png');

	const compositeImageBuffer2 = await sharp(compositeImageBuffer)
		.composite([{ input: textBuffer, gravity: 'northeast' }]) // Adjust gravity as needed
		.png()
		.toBuffer();

	attachment = new AttachmentBuilder(compositeImageBuffer2, { name: 'profile-image.png' });

	console.log('test');

	const embedd = new EmbedBuilder()
		.setTitle(`Doggo Roulette # ${daHta.monthly - 1}!`)
		.setColor('#FFC700')
		.setImage('attachment://profile-image.png')
		.setDescription(`${winnerNameArray.join('\n')} ${daHta.emote}`);

	const embeddd = new EmbedBuilder()
		.setTitle(`Doggo Roulette # ${daHta.monthly - 1}!`)
		.setImage('attachment://profile-image.png')
		.setDescription(`${winnerNameArray.join('\n')} ${daHta.emote}`);

	await sentMessage.edit({ embeds: [embedd], files: [attachment], components: [] });
	await pewChannel.send({ content: `<@${winnerArray[0]}> has been shot by Amber`, files: [attachment] });

	let previousWinners = {};
	try {
		const data = efs.readFileSync('./commands/fun/previousWinners.json', 'utf8');
		previousWinners = JSON.parse(data);
	} catch (err) {
		console.error('Error reading previous winners data:', err);
	}

	// Check if winnerArray[0] is present in previous winners
	const winnerId = winnerArray[0];
	if (previousWinners.hasOwnProperty(winnerId)) {
		// If present, increment the count
		previousWinners[winnerId]++;
	} else {
		// If not present, add with an initial count of 1
		previousWinners[winnerId] = 1;
	}

	// Write the updated data back to JSON file
	efs.writeFile('./commands/fun/previousWinners.json', JSON.stringify(previousWinners, null, 2), (err) => {
		if (err) {
			console.error('Error saving previous winners data:', err);
		} else {
			console.log('Previous winners data saved successfully.');
		}
	});
}

async function fetchUserPfp(userId, client) {
	try {
		const user = await client.users.fetch(userId);
		const thing = user.displayAvatarURL({ format: 'png', dynamic: true });
		const im = await fetch(thing);
		return Buffer.from(await im.arrayBuffer());
	} catch (error) {
		console.error(error);
		const user = await client.users.fetch('1155961824894795827');
		const thing = user.displayAvatarURL({ format: 'png', dynamic: true });
		const im = await fetch(thing);
		return Buffer.from(await im.arrayBuffer());
	}
	// try {
	//     const user = await client.users.fetch(userId);
	//      const thing = user.displayAvatarURL({ format: 'png', dynamic: true });
	//     const response = await axios.get(thing, { responseType: 'arraybuffer' });
	//     console.log('response:', response);

	//     return response.data;
	// } catch (error) {
	//     const user = await client.users.fetch('1155961824894795827');
	//      const thing = user.displayAvatarURL({ format: 'png', dynamic: true });
	//     const response = await axios.get(thing, { responseType: 'arraybuffer' });
	//     console.log('response:', response);
	//     console.error(error);
	//     return response.data; // Return null if fetching fails
	// }
}

async function monthlyIncrement(channelId) {
	const channelData = settings.channels[channelId];
	const rouletteData = channelData.rouletteData;
	rouletteData.monthly += 1;
	await fs.writeFile('./commands/fun/roulette.json', JSON.stringify(settings, null, 2));
}

async function deleteOldFiles(directoryPath) {
	// Get a list of all files in the directory
	try {
		console.log('directoryPath:', directoryPath);
		const files = await efs.promises.readdir(directoryPath);

		// Iterate through each file
		for (const file of files) {
			// console.log('file:', file);
			const filePath = path.join(directoryPath, file);

			// Check if the file is old (you can define your own criteria for old files)
			const stats = await efs.promises.stat(filePath);
			const isOldFile = Date.now() - stats.mtime.getTime() > 10 * 60 * 1000; // Example: Delete files older than 30 days
			console.log('isOldFile:', isOldFile);
			if (isOldFile) {
				// Delete the old file
				await efs.promises.unlink(filePath);
				console.log(`Deleted old file: ${filePath}`);
			}
		}
	} catch (error) {
		console.error(`Error deleting old files: ${error}`);
	}
}

module.exports = { monthlyIncrement, startRouletteOrOtherAction };
