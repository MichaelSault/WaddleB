//run this to register new global commands with Discord's REST API
import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { channels } from './channels.js';


const waddleHue = new SlashCommandBuilder()
    .setName('waddlehue')
    .setDescription('Allows WaddleB to change my lights')
    .addStringOption(option =>
        option
            .setName('hue')
            .setDescription('changes the colour')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('brightness')
            .setDescription('changes the brightness')
            .setRequired(false)
    );

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

const waddleScan = new SlashCommandBuilder()
    .setName('waddlescan')
    .setDescription('Updates the Jellyfin library Data')
    .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
    );

const waddleStatus = new SlashCommandBuilder()
    .setName('waddlestatus')
    .setDescription('Returns is a video is currently downloading')

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
    waddleHue,
    waddleJoin,
    waddlePing,
    waddleScan,
    waddleStatus,
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
