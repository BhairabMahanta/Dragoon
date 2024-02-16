const settings = require('./roulette.json');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, Events, ModalBuilder, Collection } = require('discord.js');
const fs = require('fs');
const Canvas = require('@napi-rs/canvas');
const canvas = Canvas.createCanvas(700, 250);
		const context = canvas.getContext('2d');

async function monthlyIncrement(channelId) {
	const background = await Canvas.loadImage('./crowdddd.png');

	// This uses the canvas dimensions to stretch the image onto the entire canvas
	context.drawImage(background, 0, 0, canvas.width, canvas.height);

	// Use the helpful Attachment class structure to process the file for you
	const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });
      const channelData = settings.channels[channelId];
      const rouletteData = channelData.rouletteData;
          rouletteData.monthly += 1;
                fs.writeFileSync('./commands/fun/roulette.json', JSON.stringify(settings, null, 2));
      }
    
      // Define a function to handle starting the roulette game or taking other actions
async function startRouletteOrOtherAction(participants, daHta, embed, sentMessage, users) {
    // Check if the participant limit or the inactive limit is reached
    console.log('startRouletteOrOtherAction')
    let winnerArray = [];
    let winnerNameArray = [];
    if (participants.length >= daHta.participantLimit || participants.length >= daHta.minimumParticipants) {
        // Perform the roulette game logic or other actions here
        console.log('killLimit:', daHta.killLimit);
        for (let i = 0; i < daHta.killLimit && participants.length >= 1; i++) {
            const winnerIndex = Math.floor(Math.random() * participants.length); // Randomly select a winner
            winnerArray.push(participants[winnerIndex]);
            console.log('winnerArray:', winnerArray);
            console.log('users:', users);
            winnerNameArray.push(users[winnerIndex])
            console.log('winnerArray:', winnerNameArray);
            // const winnerUser = await client.users.fetch(winner);
            participants.splice(winnerIndex, 1); // Remove the winner from the participants array
            console.log(`Participant ${winnerArray.join(',')} eliminated`);
        }
        const embedd = new EmbedBuilder()
        .setTitle(`Roulette Game # ${daHta.monthly}!`)
        .setDescription(`Doggo Roulette ended!\n ${winnerNameArray.join('\n')} ${daHta.emote}`);
       
        
        await sentMessage.edit({ embeds: [embedd], files: [attachment] });
    } else {
        // Other actions or fallback logic if conditions are not met
        console.log('Other actions or fallback logic...');
    }
}
  module.exports = { monthlyIncrement, startRouletteOrOtherAction }