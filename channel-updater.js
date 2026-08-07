import { channels } from "./channels.js";
import { downloadNew } from "./youtubedl.js";
import { withYouTubeLock } from "./youtube-lock.js";

const CHANNEL_DELAY_MS = 90_000;

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

let activeChannelUpdate = null;

async function performChannelUpdate(selectedOption) {
    const selectedChannels = selectedOption === null
        ? channels
        : channels.filter(channel =>
            channel.option === selectedOption
        );

    if (selectedChannels.length === 0) {
        throw new Error(`Unknown channel option: ${selectedOption}`);
    }

    for (const [index, channel] of selectedChannels.entries()) {
        await downloadNew(channel.channel, channel.folder);

        if (index < selectedChannels.length - 1) {
            await delay(CHANNEL_DELAY_MS);
        }
    }

    return {
        updatedChannels: selectedChannels.length,
    };
}

export async function updateChannels(selectedOption = null) {
    if (activeChannelUpdate) {
        console.log("A channel update is already running; waiting for it to finish.");
        
        try {
            await activeChannelUpdate;
        } catch {
            // The queued update should still run if the previous one failed.
        }

        return updateChannels(selectedOption);
    }

    const operationLabel = selectedOption === null
        ? "all-channel update"
        : `channel update: ${selectedOption}`;

    activeChannelUpdate = withYouTubeLock(
        operationLabel,
        () => performChannelUpdate(selectedOption)
    );

    try {
        return await activeChannelUpdate;
    } finally {
        activeChannelUpdate = null;
    }
}
