const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { monthlyIncrement, startRouletteOrOtherAction } = require('./someFunctions');
class RouletteGame {
    constructor(channelId, settings, client) {
        this.channelId = channelId;
        this.settings = settings;
        this.client = client;
        this.participants = [];
        this.users = [];
        this.startTime = null;
        this.sentMessage = null;
        this.daHta = this.settings.channels[this.channelId].rouletteData
        this.isDone = false;
    }

    async start() {
        // Load current settings
        if (!this.settings.channels.hasOwnProperty(this.channelId)) return;

        const channelData = this.settings.channels[this.channelId];
        const daHta = channelData.rouletteData;


        // Check if rouletteData is defined for the channel
        if (!channelData.rouletteData) return;

        // Check if it's time to trigger a roulette game based on spawnChance and interval
        const shouldTrigger = Math.random() * 100 <= daHta.spawnChance;
        if (!shouldTrigger) return;

        // Create the initial embed
        const embed = new EmbedBuilder()
            .setTitle(`Roulette Game # ${daHta.monthly}!`)
            .setDescription(`React with the button ${daHta.emote}`)
            .addFields({ name: 'Participants', value: this.participants.length === 0 ? `None, aborting it if ${daHta.inactiveLimit / 60000} minutes cross without any participants!` : this.participants.join('\n'), inline: false })
            .addFields({ name: 'Participant Limit', value: `${this.participants.length}/${daHta.participantLimit}`, inline: false });

        // Create the action row with the button
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('join_roulette')
                    .setLabel('Join Roulette')
                    .setStyle('Primary')
            );

        // Send the initial embed with the button
        this.sentMessage = await this.client.channels.cache.get(this.channelId).send({ embeds: [embed], components: [row] });

        // Create a message collector for the button
        const filter = i => (['join_roulette'].includes(i.customId)) || (i.customId === 'option_select');
        const collector = this.sentMessage.createMessageComponentCollector({ filter, time: daHta.inactiveLimit });

        this.startTime = Date.now();

        // Event listener for the button click
        collector.on('collect', async interaction => {
            try {
                interaction.deferUpdate();

                if (!this.participants.includes(interaction.user.id)) {
                    this.participants.push(interaction.user.id);
                    this.users.push(interaction.user.username);

                    embed.data.fields[0].value = this.users.join('\n');
                    embed.data.fields[1].value = `${this.participants.length}/${daHta.participantLimit}`;

                    await this.sentMessage.edit({ embeds: [embed], components: [row] });
                } else {
                    this.sentMessage.channel.send({ content: 'You have a deathwish trying to participate multiple times!?', ephemeral: true });
                }

                const elapsedTime = Date.now() - this.startTime;
                console.log('Elapsed time: before end', elapsedTime);
console.log('participants', this.participants.length);
console.log('daHta.participantLimit', daHta.participantLimit);
                if (this.participants.length >= daHta.participantLimit ) {
                    await startRouletteOrOtherAction(this.participants, this.daHta, this.sentMessage, this.users , this.client);
                    this.isDone = true;
                }
            } catch (error) {
                console.log('error (i think someone spamming the button', error);
            }
        });

        // Event listener for the collector end
        collector.on('end', async () => {
            const elapsedTime = Date.now() - this.startTime;
            console.log('Elapsed time:', elapsedTime);
            if ((this.participants.length >= daHta.participantLimit && !this.isDone)|| ((elapsedTime >= daHta.inactiveLimit && this.participants.length >= daHta.minimumParticipants && !this.isDone))) {
                await startRouletteOrOtherAction(this.participants, this.daHta, this.sentMessage, this.users , this.client);
            }
        });
    }

    async startRouletteOrOtherAction(dahta, embed, sentMessage) {
        // Your logic for starting the roulette game or other actions
    }
}

module.exports = {RouletteGame};
