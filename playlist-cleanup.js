import fs from "node:fs/promises";
import path from "node:path";

import { getWatchedPlaylistItems } from "./jellyfin-client.js";
import { PLAYLIST_SEASON_DIRECTORY, WATCHED_RETENTION_MS } from "./playlist-config.js";
import { generatePlaylistNfoFiles } from "./playlist-nfo.js";

function isPastRetentionPeriod(item, currentTime) {
    const lastPlayedTime = Date.parse(item.lastPlayedDate);

    // Number.isFinite checks for a valid number returned by Data.parse
    return Number.isFinite(lastPlayedTime) && ((currentTime - lastPlayedTime) >= WATCHED_RETENTION_MS);
}

async function findVideoDirectory(youtubeId) {
    const entries = await fs.readdir(
        PLAYLIST_SEASON_DIRECTORY,
        { withFileTypes: true }
    );

    const matches = entries.filter(entry =>
        entry.isDirectory()
        && !entry.isSymbolicLink()
        && entry.name.endsWith(`[${youtubeId}]`)
    );

    if (matches.length !== 1) {
        console.warn(
            `Expected one folder for ${youtubeId}, found ${matches.length}; skipping.`
        );
        return null;
    }

    const seasonDirectory = path.resolve(PLAYLIST_SEASON_DIRECTORY);
    const videoDirectory = path.resolve(
        seasonDirectory,
        matches[0].name
    );

    if (
        path.dirname(videoDirectory).toLowerCase()
        !== seasonDirectory.toLowerCase()
    ) {
        throw new Error(
            `Unsafe playlist cleanup path rejected: ${videoDirectory}`
        );
    }

    return videoDirectory;
}

export async function cleanupWatchedPlaylistVideos({
    dryRun = true,
} = {}) {
    const watchedItems = await getWatchedPlaylistItems();
    const currentTime = Date.now();

    const expiredItems = [
        ...new Map(
            watchedItems
                .filter(item => isPastRetentionPeriod(item, currentTime))
                .map(item => [item.youtubeId, item])
        ).values(),
    ];

    let deletedCount = 0;

    for (const item of expiredItems) {
        const videoDirectory = await findVideoDirectory(item.youtubeId);

        if (!videoDirectory) {
            continue;
        }

        if (dryRun) {
            console.log(
                `[Dry run] Would delete watched video folder: ${videoDirectory}`
            );
            continue;
        }

        // file deletion for any watched videos
        await fs.rm(videoDirectory, {
            recursive: true,
            force: false,
        });

        deletedCount += 1;
        console.log(`Deleted watched video folder: ${videoDirectory}`);
    }

    if (deletedCount > 0) {
        await generatePlaylistNfoFiles();
    }

    return {
        eligibleCount: expiredItems.length,
        deletedCount,
        dryRun
    };
}
