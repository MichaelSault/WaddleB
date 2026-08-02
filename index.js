import { ChannelType, Client, Events, SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';

import { downloadNew, downloadVideo, generateNFO } from './youtubedl.js';
import { channels } from './channels.js';

import * as dotenv from 'dotenv';
dotenv.config();
const TOKEN = process.env.DISCORD_TOKEN;
const YT_DELAY = 90_000; //waits 90 seconds
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const client = new Client({intents: []});


client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {

        if(interaction.commandName === "waddleping"){
            interaction.reply('Waddle Pong!');
        }

        else if(interaction.commandName === "waddlejoin"){
            const voiceChannel = interaction.options.getChannel('channel');
            const voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
        }

        else if(interaction.commandName === "waddleupdate"){
            interaction.reply("WaddleB is grabbing new content")
            
            const selectedChannel = interaction.options.getString('channel');

            if (selectedChannel == null) {
                for (let i = 0; i < channels.length; i++) {
                    const channel = channels[i];
                    await downloadNew(channel.channel, channel.folder);

                    if (i < channels.length - 1) {
                        await delay(YT_DELAY);
                    }
                }
            } else {
                const channel = channels.find(
                    channel => channel.option === selectedChannel
                );

                await downloadNew(channel.channel, channel.folder);
            }
        }

        else if(interaction.commandName === "waddlevideo"){
            const url = interaction.options.getString('url', true);
            interaction.reply(`WaddleB is fetching: ${url}`);
            downloadVideo(url);
        }
    }
});


client.login(TOKEN); //logs in the bot using the token provided via the .env file
