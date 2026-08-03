import fs from "node:fs/promises";
import path from "node:path";
import { YtDlp } from "ytdlp-nodejs";

//imports playlist helper functions
import { PLAYLIST_ARCHIVE_FILE, PLAYLIST_SEASON_DIRECTORY, PLAYLIST_TEST_MODE, PLAYLIST_URL } from "./playlist-config.js";
import { generatePlaylistNfoFiles } from "./playlist-nfo.js";

const ytdlp = new YtDlp();

// handles video unavailable error
function isUnavailableVideoError(error) {
    return /video unavailable|private video|members-only|blocked due to claimed content/i
        .test(error.message ?? "");
}

// called every 6 hours to look for any new videos
export async function downloadStaticPlaylist() {
    await fs.mkdir(PLAYLIST_SEASON_DIRECTORY, { recursive: true });
    await fs.mkdir(path.dirname(PLAYLIST_ARCHIVE_FILE), { recursive: true });

    const outputTemplate = path.join(
        PLAYLIST_SEASON_DIRECTORY,
        "%(title)s [%(id)s]",
        "%(title)s [%(id)s].%(ext)s"
    );

    let result = null;
    let downloadError = null;

    try {
        result = await ytdlp.downloadAsync(PLAYLIST_URL, {
            format: {
                filter: "mergevideo",
                quality: "highest",
                format: "mkv",
            },
            output: outputTemplate,
            downloadArchive: PLAYLIST_ARCHIVE_FILE,
            playlistEnd: PLAYLIST_TEST_MODE ? 1 : undefined,
            yesPlaylist: true,
            ignoreErrors: true,
            embedChapters: true,
            embedInfoJson: true,
            embedSubs: true,
            embedMetadata: true,
            embedThumbnail: true,
            writeThumbnail: true,
            writeInfoJson: true,
            noWritePlaylistMetafiles: true,
            cookies: "cookies-yt.txt",
            sleepRequests: 2,
            sleepInterval: 10,
            maxSleepInterval: 30,
            onProgress: progress => {
                console.log(
                    "Static playlist download progress:",
                    progress.percentage
                );
            },
        });
    } catch (error) {
        downloadError = error;

        if (isUnavailableVideoError(error)) {
            console.warn(
                "Playlist contained an unavailable video; continuing with downloaded videos."
            );
        }
    }

    await generatePlaylistNfoFiles();

    if (downloadError && !isUnavailableVideoError(downloadError)) {
        throw downloadError;
    }

    console.log("Static playlist scan completed.");
    return result;
}
