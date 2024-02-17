/*
async function rouletteInit(channelId) {
    // Load current settings
     // Check if the channel is being watched
     let participants = [];
     let users = [];
    if (!settings.channels.hasOwnProperty(channelId)) return;
  
    const channelData = settings.channels[channelId];
  const daHta = channelData.rouletteData
    // Check if rouletteData is defined for the channel
    if (!channelData.rouletteData) return;
  
   
    // Check if it's time to trigger a roulette game based on spawnChance and interval
    const shouldTrigger = Math.random() * 100 <= daHta.spawnChance;
    if (!shouldTrigger) return;
  
    // Create the initial embed
    const embed = new EmbedBuilder()
      .setTitle(`Roulette Game # ${daHta.monthly}!`)
      .setDescription(`React with the button ${daHta.emote}`)
      .addFields({ name: 'Participants', value: participants.length === 0 ? `None, aborting it if ${daHta.inactiveLimit/ 60000} minutes cross without any participants!` : participants.join('\n'), inline: false})
      .addFields({ name:'Participant Limit', value: `${participants.length}/${daHta.participantLimit}`, inline: false });
  
    // Create the action row with the button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('join_roulette')
          .setLabel('Join Roulette')
          .setStyle('Primary')
      );

    // Send the initial embed with the button
    const sentMessage = await client.channels.cache.get(channelId).send({ embeds: [embed], components: [row] });
    // Create a message collector for the button
    const filter = i => (['join_roulette'].includes(i.customId)) || (i.customId === 'option_select');
    const collector = sentMessage.createMessageComponentCollector({ filter, time: daHta.inactiveLimit });
    let startTime
    
      startTime = Date.now();
    // Event listener for the button click
    collector.on('collect', async interaction => {
      try {
      // Check if the user is already a participant
      interaction.deferUpdate();
    
      if (!participants.includes(interaction.user.id)) {
        // Add the user to the participants list
        participants.push(interaction.user.id);
        // Update the embed with the new participant
        users.push(interaction.user.username);

        embed.data.fields[0].value = users.join('\n');
        embed.data.fields[1].value = `${participants.length}/${daHta.participantLimit}`;
        // Update the message with the new embed
        await sentMessage.edit({ embeds: [embed], components: [row] });
      } else     // if (interaction.customId === 'join_roulette') {
        if (participants.includes(interaction.user.id)) {
          sentMessage.channel.send({ content: 'You have a deathwish trying to participate multiple times!?', ephemeral: true });
        // }
        }
        const elapsedTime = Date.now() - startTime;
        console.log('Elapsed time:', elapsedTime);

      // Check if the participant limit or the inactive limit is reached
      if (participants.length >= daHta.participantLimit || (elapsedTime >= daHta.inactiveLimit && participants.length >= daHta.minimumParticipants)) {
await startRouletteOrOtherAction(participants, daHta, embed, sentMessage, users, client);
      }
    } catch (error) {
      console.log('error (i think someone spamming the button', error);
    }
    });
  
    // Event listener for the collector end
    collector.on('end', async () => {
      const elapsedTime = Date.now() - startTime;
      console.log('Elapsed time:', elapsedTime);
      if (participants.length >= daHta.participantLimit || (elapsedTime >= daHta.inactiveLimit && participants.length >= daHta.minimumParticipants)) {
        await startRouletteOrOtherAction(participants, daHta, embed, sentMessage, users, client);
      }
      // Your logic when the collector ends
    });
  
  };*/

// const pfp = await fetchUserPfp(winner1, client);
// Fetch the avatar image and save it locally
// const avatarURL = pfp;
// let imagePath;
// const uniqueFilename = `avatar_${uuidv4()}.webp`;
//     imagePath = `./avatars/${uniqueFilename}`; // Local path to save the image
//      await downloadImage(avatarURL, imagePath);

// var imBuffer = await fetch(`${message.attachments.first()?.url}`);
// var im = sharp(Buffer.from(await imBuffer.arrayBuffer()));

// const cdnUrl = 'https://cdn.discordapp.com';
// async function downloadImage(response, pathy) {
// Check if the file exists before attempting to write to it
// if (await fileExists(pathy)) {
//     // If the file exists, log a message indicating that it's in use
//     console.log(`File ${pathy} is in use. Retrying deletion after a delay...`);
//     // Retry deletion after a delay (e.g., 1 second)
//     setTimeout(() => {
//         deleteFile(pathy);
//     }, 1000); // Adjust the delay time as needed
//     return;
// }
// await deleteOldFiles('./avatars');
// // Write the response data to the file
// try {
//      await fs.writeFile(pathy, response);
//     console.log(`File saved as: ${pathy}`);
// } catch (error) {
//     console.error(`Error saving file: ${error}`);
// }
// }

// async function fileExists(path) {
// 	try {
// 		await fs.access(path); // Check if the file exists
// 		return true; // File exists
// 	} catch (error) {
// 		return false; // File does not exist
// 	}
// }

// async function deleteFile(path) {
// 	try {
// 		await fs.unlink(path); // Attempt to delete the file
// 		console.log(`File ${path} deleted successfully`);
// 	} catch (error) {
// 		console.error(`Error deleting file: ${error}`);
// 	}
// }

// async function deleteOldFiles(directoryPath) {
// 	// Get a list of all files in the directory
// 	try {
// 		console.log('directoryPath:', directoryPath);
// 		const files = await efs.promises.readdir(directoryPath);

// 		// Iterate through each file
// 		for (const file of files) {
// 			// console.log('file:', file);
// 			const filePath = path.join(directoryPath, file);

// 			// Check if the file is old (you can define your own criteria for old files)
// 			const stats = await efs.promises.stat(filePath);
// 			const isOldFile = Date.now() - stats.mtime.getTime() > 10 * 60 * 1000; // Example: Delete files older than 30 days
// 			console.log('isOldFile:', isOldFile);
// 			if (isOldFile) {
// 				// Delete the old file
// 				await efs.promises.unlink(filePath);
// 				console.log(`Deleted old file: ${filePath}`);
// 			}
// 		}
// 	} catch (error) {
// 		console.error(`Error deleting old files: ${error}`);
// 	}
// }
