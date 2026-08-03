//run this to register new global commands with Discord's REST API
import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, ChannelType } from 'discord.js';
import { channels } from './channels.js';


const waddleJoin = new SlashCommandBuilder()
    .setName('waddlejoin')
    .setDescription('Pulls WaddleB into VC')
    .addChannelOption((option) => 
        option.setName('channel')
        .setDescription('The channel to join')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    );

const waddlePing = new SlashCommandBuilder()
    .setName('waddleping')
    .setDescription('Returns waddle pong!')

const waddleUpdate = new SlashCommandBuilder()
    .setName('waddleupdate')
    .setDescription('Download new videos from one channel or all channels')
    .addStringOption(option =>
        option
            .setName('channel')
            .setDescription('Choose a channel, or leave blank to update all')
            .setRequired(false)
            .addChoices(
                ...channels.map(source => ({
                    name: source.folder,
                    value: source.option
                }))
            )
    );

const waddleVideo = new SlashCommandBuilder()
    .setName('waddlevideo')
    .setDescription('Download a linked YouTube video')
    .addStringOption(option =>
        option
            .setName('url')
            .setDescription('The YouTube video URL')
            .setRequired(true)
    );



const commands = [
    waddleJoin,
    waddlePing,
    waddleUpdate,
    waddleVideo
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

await rest.put(
    Routes.applicationCommands(
        process.env.DISCORD_CLIENT_ID
    ),
    { body: commands }
);

console.log(`Registered ${commands.length} global slash command(s).`);
