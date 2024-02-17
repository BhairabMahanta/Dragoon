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