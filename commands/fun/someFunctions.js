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
async function startRouletteOrOtherAction(participants, actualParticipants, daHta, sentMessage, users, client) {
	pewChannel = client.channels.cache.get('1207557983903416340');
	console.log('pewChannel:', pewChannel);
	// Check if the participant limit or the inactive limit is reached
	console.log('startRouletteOrOtherAction');
	let winnerArray = [];
	let actualWinnerArray = [];
	let winnerNameArray = [];
	// Perform the roulette game logic or other actions here
	console.log('killLimit:', daHta.killLimit);
	const winnerIndex = Math.floor(Math.random() * participants.length);
	winnerArray.push(participants[winnerIndex]);
	actualWinnerArray.push(actualParticipants[winnerIndex]);
	winnerNameArray.push(users[winnerIndex]);
	console.log(`Participant ${winnerArray.join(',')} eliminated`);
	/*for (let i = 0; i < daHta.killLimit && participants.length >= 1; i++) {
		const winnerIndex = Math.floor(Math.random() * participants.length); // Randomly select a winner
		console.log('winnerIndex:', winnerIndex);
		console.log('participants:', participants);
		winnerArray.push(participants[winnerIndex]);
		actualWinnerArray.push(actualParticipants[winnerIndex]);
		console.log('actualWinnerArray:', actualWinnerArray);
		console.log('winnerArray:', winnerArray);
		console.log('users:', users);
		winnerNameArray.push(users[winnerIndex]);
		console.log('winnerArray:', winnerNameArray);
		// const winnerUser = await client.users.fetch(winner);
		//	participants.splice(winnerIndex, 1); // Remove the winner from the participants array
		console.log(`Participant ${winnerArray.join(',')} eliminated`);
	}*/

	const winner1 = actualWinnerArray[0];
	console.log('winner1:', winner1);
	const pfp = await fetchUserPfp(winner1, client);
	// console.log('pfp:', pfp);
	// console.log('test');
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
	const fontSize = 24; // Initial font size
	const maxWidth = 8.5 * fontSize; // Maximum width for 17 characters
	let adjustedFontSize = fontSize;

	// Function to calculate text width
	function getTextWidth(text, font) {
		// Create a temporary canvas for measuring text width
		const tempCanvas = Canvas.createCanvas(1, 1);
		const tempCtx = tempCanvas.getContext('2d');
		tempCtx.font = font;
		return tempCtx.measureText(text).width;
	}

	// Reduce font size until text fits within the specified width
	while (getTextWidth(text, `${adjustedFontSize}px Arial`) > maxWidth) {
		adjustedFontSize--; // Decrease font size
	}
	const textCanvas = Canvas.createCanvas(1440, 720); // Adjust dimensions as needed
	const textCtx = textCanvas.getContext('2d');

	// Set font properties
	textCtx.font = `${adjustedFontSize}px Arial`;
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
	await sentMessage.delete();
	const datae = efs.readFileSync('./commands/fun/previousWinners.json', 'utf8');

	const previousWinnerz = JSON.parse(datae);
	const shotId = winnerArray[0];
	let amount = previousWinnerz[shotId] + 1;
	if (isNaN(amount)) {
		// If amount is NaN, set it to 1
		amount = 1;
	}
	await sentMessage.channel.send({
		embeds: [],
		content: `<@${winnerArray[0]}> has been shot by Amber! They have been shot ${amount} times this month`,
		components: [],
	});
	if (sentMessage.guild) {
		const guildId = sentMessage.guild.id; // Get the guild ID
		const guild = sentMessage.guild; // Get the guild object

		// Now you can use the guild ID or guild object to access guild-related information
		console.log(`Guild ID: ${guildId}`);
		console.log('Guild Name:', guild.name);
		const member = guild.members.cache.get(shotId);
		await member
			.timeout(10 * 60 * 1000, 'They deserved it')
			.then(console.log)
			.catch(console.error);
	}
	await pewChannel.send({ files: [attachment] });

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

module.exports = { monthlyIncrement, startRouletteOrOtherAction };
