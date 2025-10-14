import { ChannelType, Client, Events, SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';

import * as dotenv from 'dotenv';
dotenv.config();
const TOKEN = process.env.DISCORD_TOKEN;

console.log( TOKEN );

const client = new Client({intents: []});

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.username}`);

    const ping = new SlashCommandBuilder()
        .setName("waddleping")
        .setDescription("Replies with pong!");

    const join = new SlashCommandBuilder()
        .setName('waddlejoin')
        .setDescription('Joins a Voice Channel')
        .addChannelOption((option) => 
            option.setName('channel')
            .setDescription('The channel to join')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .toJSON();

});

client.on(Events.InteractionCreate, interaction => {
    if (interaction.isChatInputCommand()) {

        if(interaction.commandName === "waddleping"){
            interaction.reply("Waddle Pong!");
        }

        else if(interaction.commandName === "waddlejoin"){
            const voiceChannel = interaction.options.getChannel('channel');
            const voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
        }
    }
});


client.login(TOKEN); //logs in the bot using the token provided via the .env file