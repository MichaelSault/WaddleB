import { ChannelType, Client, Events, SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';

import { downloadNew, downloadVideo } from './youtubedl.js';

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

    const downloadNew = new SlashCommandBuilder()
        .setName('waddleupdate')
        .setDescription('Updates followed youtube channels!');

    const downloadVideo = new SlashCommandBuilder()
        .setName('waddlefetch')
        .setDescription('Downloads the linked youtube video!')
        .addChannelOption((option) =>
            option.setName('url')
            .setDescription('The URL of the video to download')
            .setRequired(true)
        )
        .toJSON();
});

client.on(Events.InteractionCreate, interaction => {
    if (interaction.isChatInputCommand()) {

        if(interaction.commandName === "waddleupdate"){
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

        else if(interaction.commandName === "waddleping"){
            interaction.reply("WaddleB is grabbing new content")
            const favorites = ['KeltieOConnor', 'theswiftologist', 'forestyforest', 'johnnyharris', 'CurrentlyHannah', 'GameGrumps', 'PhilyBowden', 'rileyrehl', 'ZoeTwoDotss'];
            const folders = ["Keltie O'Connor", 'Swiftologist', 'Foresty Forest', 'Johnny Harris', 'Currently Hannah', 'GameGrumps', 'Phily Bowden', 'Riley Rehl', 'ZoëTwoDots'];
            
            for (var i=0; i< favorites.length; i++) {
                downloadNew(favorites[i], folders[i]);
            };
            
        }

        else if(interaction.commandName === "waddlefetch"){
            interaction.reply("WaddleB is fetching", url)
        }
    }
});


client.login(TOKEN); //logs in the bot using the token provided via the .env file