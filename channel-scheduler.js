import { updateChannels } from "./channel-updater.js";

const CHANNEL_UPDATE_TIMES = [
    { hour: 13, minute: 10 },   // 1:10pm
    { hour: 18, minute: 10 },   // 6:10pm
    { hour: 23, minute: 10 }    // 11:10pm
];

let channelUpdateTimer = null;

export function getNextChannelUpdate(currentTime = new Date()) {
    for (const updateTime of CHANNEL_UPDATE_TIMES) {
        const candidate = new Date(currentTime);

        candidate.setHours(
            updateTime.hour,
            updateTime.minute,
            0,
            0
        );

        if (candidate > currentTime) {
            return candidate;
        }
    }

    const nextUpdate = new Date(currentTime);
    const firstUpdate = CHANNEL_UPDATE_TIMES[0];

    nextUpdate.setDate(nextUpdate.getDate() + 1);
    nextUpdate.setHours(
        firstUpdate.hour,
        firstUpdate.minute,
        0,
        0
    );

    return nextUpdate;
}

async function runScheduledChannelUpdate() {
    console.log("Starting scheduled channel update.");

    try {
        const result = await updateChannels();
        console.log(`Scheduled channel update completed for ${result.updatedChannels} channels.`);
    } catch (error) {
        console.error("Scheduled channel update failed:", error);
    } finally {
        scheduleNextChannelUpdate();
    }
}

function scheduleNextChannelUpdate() {
    const nextUpdate = getNextChannelUpdate();
    const delay = nextUpdate.getTime() - Date.now();

    channelUpdateTimer = setTimeout(() => {
        channelUpdateTimer = null;
        void runScheduledChannelUpdate();
    }, delay);

    console.log(`Next channel update scheduled for ${nextUpdate.toLocaleString()}.`);
}

export function startDailyChannelUpdates() {
    if (channelUpdateTimer) {
        return;
    }

    scheduleNextChannelUpdate();
}
