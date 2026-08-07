import { ChannelType, Client, Events, SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';

import { downloadVideo } from './youtubedl.js';
import { updateChannels } from './channel-updater.js';
import { startDailyChannelUpdates } from './channel-scheduler.js';
import { startPlaylistMaintenance } from './playlist-scheduler.js';
import { isYouTubeBusy } from './youtube-lock.js';
import { scanJellyfinLibrary } from './jellyfin-client.js';

import * as dotenv from 'dotenv';

dotenv.config();
const TOKEN = process.env.DISCORD_TOKEN;

const YOUTUBE_BUSY_MESSAGE = "WaddleB is already hard at work, please try again later.";

const client = new Client({intents: []});

client.once(Events.ClientReady, readyClient => {
    console.log(`WaddleB is ready as ${readyClient.user.tag}`);
    startPlaylistMaintenance();
    startDailyChannelUpdates();
});


client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {

        if(interaction.commandName === "waddleping"){
            interaction.reply('Waddle Pong!');
        }

        else if(interaction.commandName === "waddlehue"){
            // will be used to control my hue lights remotely
        }

        else if(interaction.commandName === "waddlejoin"){
            const voiceChannel = interaction.options.getChannel('channel');
            const voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
        }

        else if(interaction.commandName === 'waddlescan'){
            await interaction.deferReply();

            try {
                await scanJellyfinLibrary();

                await interaction.editReply( "WaddleB is scanning the library." );
            } catch (error) {
                console.error( "Could not start the Jellyfin library scan", error);

                await interaction.editReply( "WaddleB was unable to scan the library.");
            }
        }

        else if(interaction.commandName === "waddlestatus"){
            // will return what operation is currently in progress
        }

        else if(interaction.commandName === "waddleupdate"){
            if (isYouTubeBusy()) {
                await interaction.reply(YOUTUBE_BUSY_MESSAGE);
                return;
            }

            interaction.reply("WaddleB is grabbing new content")
            
            const selectedChannel = interaction.options.getString('channel');
            await updateChannels(selectedChannel);
        }

        else if(interaction.commandName === "waddlevideo"){
            if (isYouTubeBusy()) {
                await interaction.reply(YOUTUBE_BUSY_MESSAGE);
                return;
            }

            const url = interaction.options.getString('url', true);
            interaction.reply(`WaddleB is fetching: ${url}`);
            downloadVideo(url);
        }
    }
});


client.login(TOKEN); //logs in the bot using the token provided via the .env file
