import path from "node:path";
import "dotenv/config";

export const PLAYLIST_URL = process.env.PLAYLIST_URL;

export const PLAYLIST_DOWNLOAD_DIRECTORY = process.env.PLAYLIST_DOWNLOAD_DIRECTORY;
export const PLAYLIST_SEASON_NUMBER = 1;
export const PLAYLIST_SEASON_DIRECTORY = path.join( PLAYLIST_DOWNLOAD_DIRECTORY, `Season ${String(PLAYLIST_SEASON_NUMBER).padStart(2, "0")}` );

export const PLAYLIST_ARCHIVE_FILE = path.join(
    process.cwd(),
    "data",
    "playlist-download-archive.txt"
);

export const PLAYLIST_SCAN_INTERVAL_MS = 6 * 60 * 60 * 1000;    // grabs new videos every 6 hours
export const WATCHED_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;    // deletes watched videos after 3 days
export const PLAYLIST_TEST_MODE = (process.env.PLAYLIST_TEST_MODE !== "false"); // enables test mode to prevent deletion

export const JELLYFIN_URL = process.env.JELLYFIN_URL?.replace(/\/+$/, "");

export const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;
export const JELLYFIN_USER_ID = process.env.JELLYFIN_USER_ID;
export const JELLYFIN_PLAYLIST_DIRECTORY = process.env.JELLYFIN_PLAYLIST_DIRECTORY;

export function validatePlaylistConfiguration() {
    const missingSettings = [
        ["JELLYFIN_URL", JELLYFIN_URL],
        ["JELLYFIN_API_KEY", JELLYFIN_API_KEY],
        ["JELLYFIN_USER_ID", JELLYFIN_USER_ID],
        ["JELLYFIN_PLAYLIST_DIRECTORY", JELLYFIN_PLAYLIST_DIRECTORY]
    ]
        .filter(([, value]) => !value)
        .map(([name]) => name);

    if (missingSettings.length > 0) {
        throw new Error(
            `Missing required settings: ${missingSettings.join(", ")}`
        );
    }
}
