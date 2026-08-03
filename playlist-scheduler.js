import { cleanupWatchedPlaylistVideos } from "./playlist-cleanup.js";
import { PLAYLIST_SCAN_INTERVAL_MS, PLAYLIST_TEST_MODE } from "./playlist-config.js";
import { downloadStaticPlaylist } from "./playlist-downloader.js";

let activeMaintenance = null;
let maintenanceTimer = null;

async function performPlaylistMaintenance() {
    let downloadResult = null;
    let cleanupResult = null;

    // downloads any videos from the specified playlist not already logged
    try {
        downloadResult = await downloadStaticPlaylist();
    } catch (error) {
        console.error("Static playlist download failed:", error);
    }

    // removes any video files watched over 3 days ago
    try {
        cleanupResult = await cleanupWatchedPlaylistVideos({
            dryRun: PLAYLIST_TEST_MODE,
        });
    } catch (error) {
        console.error("Playlist cleanup failed:", error);
    }

    return {
        downloadResult,
        cleanupResult,
    };
}

export async function runPlaylistMaintenance() {
    if (activeMaintenance) {
        console.log(
            "Playlist maintenance is already running; skipping overlapping scan."
        );
        return activeMaintenance;
    }

    // sets the activeMaintenance flag to true, preventing the maintenance system from running again
    activeMaintenance = performPlaylistMaintenance();

    try {
        return await activeMaintenance;
    } finally {
        activeMaintenance = null;
    }
}

export function startPlaylistMaintenance() {
    if (maintenanceTimer) {
        return;
    }

    void runPlaylistMaintenance();

    maintenanceTimer = setInterval(() => {
        void runPlaylistMaintenance();
    }, PLAYLIST_SCAN_INTERVAL_MS);

    console.log("Playlist maintenance scheduled every six hours.");
}
