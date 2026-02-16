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

    const waddleNew = new SlashCommandBuilder()
        .setName('waddleupdate')
        .setDescription('Updates followed youtube channels!');

    const waddleVideo = new SlashCommandBuilder()
        .setName('waddlevideo')
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
            const favorites = ['KeltieOConnor', 'graciekramer14', 'makariespe', /**'thegrumps',**/ 'CurrentlyHannah', /**'GameGrumps',**/ 'PhilyBowden', 'rileyrehl', 'bugfishhhh', 'EthosLab'];
            const folders = ["Keltie O'Connor", 'Gracie Kramer', 'Makari Espe', /**'The Grumps',**/ 'Currently Hannah', /**'GameGrumps',**/ 'Phily Bowden', 'Riley Rehl', 'bugfishhhh', 'EthosLab'];
            
            for (var i=0; i< favorites.length; i++) {
                downloadNew("graciekramer14", "Gracie Kramer");
            };
            
        }

        else if(interaction.commandName === "ping"){
            const url = 'https://www.youtube.com/watch?v=tollGa3S0o8';
            interaction.reply("WaddleB is fetching", url);
            downloadVideo(url);
        }
    }
});


client.login(TOKEN); //logs in the bot using the token provided via the .env file