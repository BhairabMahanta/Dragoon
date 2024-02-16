const settings = require('./roulette.json');
const { request } = require('undici');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, Events, ModalBuilder, Collection, AttachmentBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises; // Import fs.promises for asynchronous file
const efs = require('fs')
const Canvas = require('@napi-rs/canvas');
const sharp = require('sharp')
const axios = require('axios');
const canvas = Canvas.createCanvas(1440, 720);
const background = './commands/fun/crowdddd.png'
const Jimp = require('jimp'); // For mask creation
let attachment

const path = require('path');

// Define the directory where you want to save the avatar image



      // Define a function to handle starting the roulette game or taking other actions
async function startRouletteOrOtherAction(participants, daHta, sentMessage, users, client) {


    // Check if the participant limit or the inactive limit is reached
    console.log('startRouletteOrOtherAction')
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
            winnerNameArray.push(users[winnerIndex])
            console.log('winnerArray:', winnerNameArray);
            // const winnerUser = await client.users.fetch(winner);
            participants.splice(winnerIndex, 1); // Remove the winner from the participants array
            console.log(`Participant ${winnerArray.join(',')} eliminated`);
        }
        
        
        const winner1 = winnerArray[0];
        const pfp = await fetchUserPfp(winner1, client)
// Fetch the avatar image and save it locally
const avatarURL = pfp;
let imagePath;
const uniqueFilename = `avatar_${uuidv4()}.webp`;
    imagePath = `./avatars/${uniqueFilename}`; // Local path to save the image
     await downloadImage(avatarURL, imagePath);

// const cdnUrl = 'https://cdn.discordapp.com';
console.log('test')
const resizedImage = await sharp(imagePath)
.rotate(-2, { background: 'transparent' })
.resize(117, 117, { fit: sharp.fit.inside }) // Resize proportionally
.toBuffer();
// setTimeout(() => {
//     // Delete the existing avatar file when job is done
//     fs.unlink(imagePath, (err) => {
//         if (err) {
//             console.error('Error deleting avatar file:', err);
//         } else {
//             console.log('Avatar file deleted successfully');
//         }
//     });
// }, 1000); // Adjust the delay time (in milliseconds) as needed
// Set the size and position of the circle
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


    
        console.log('test')
        attachment = new AttachmentBuilder(compositeImageBuffer, { name: 'profile-image.png'});
        
        console.log('test')


        const embedd = new EmbedBuilder()
        .setTitle(`Doggo Roulette # ${daHta.monthly - 1}!`)
        .setImage('attachment://profile-image.png')
        .setDescription(`${winnerNameArray.join('\n')} ${daHta.emote}`);
       
        
        await sentMessage.edit({ embeds: [embedd], files: [attachment], components: [] });
    
  
}



async function downloadImage(response, pathy) {
    // Check if the file exists before attempting to write to it
    if (await fileExists(pathy)) {
        // If the file exists, log a message indicating that it's in use
        console.log(`File ${pathy} is in use. Retrying deletion after a delay...`);
        // Retry deletion after a delay (e.g., 1 second)
        setTimeout(() => {
            deleteFile(pathy);
        }, 1000); // Adjust the delay time as needed
        return;
    }
    await deleteOldFiles('./avatars');
    // Write the response data to the file
    try {
         await fs.writeFile(pathy, response);
        console.log(`File saved as: ${pathy}`);
    } catch (error) {
        console.error(`Error saving file: ${error}`);
    }
}

async function fileExists(path) {
    try {
        await fs.access(path); // Check if the file exists
        return true; // File exists
    } catch (error) {
        return false; // File does not exist
    }
}

async function deleteFile(path) {
    try {
        await fs.unlink(path); // Attempt to delete the file
        console.log(`File ${path} deleted successfully`);
    } catch (error) {
        console.error(`Error deleting file: ${error}`);
    }
}

async function fetchUserPfp(userId, client) {
    try {
        const user = await client.users.fetch(userId);
         const thing = user.displayAvatarURL({ format: 'png', dynamic: true });
        const response = await axios.get(thing, { responseType: 'arraybuffer' });
 
        return response.data; 
    } catch (error) {
        console.error(error);
        return null; // Return null if fetching fails
    }
}






async function monthlyIncrement(channelId) {
    const channelData = settings.channels[channelId];
    const rouletteData = channelData.rouletteData;
        rouletteData.monthly += 1;
        await  fs.writeFile('./commands/fun/roulette.json', JSON.stringify(settings, null, 2));
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
                const isOldFile = Date.now() - stats.mtime.getTime() > ( 10* 60 * 1000); // Example: Delete files older than 30 days
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
    

  module.exports = { monthlyIncrement, startRouletteOrOtherAction }