import { format } from 'path';
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

export async function downloadNew(channel, folder) {
    const url = "https://www.youtube.com/@"+ channel;

    try {
        const output = await ytdlp.downloadAsync(
        url,
        {
            format: {
                filter: 'mergevideo',
                quality: 'highest',
                format: 'mkv'
            },
            onProgress: (progress) => {
                console.log("video progress", progress.percentage);
            },
            output: "S:/Jellyfin/Youtube/" + folder + "/%(title)s.%(ext)s",
            embedChapters: true,
            embedInfoJson: true,
            embedSubs: true,
            embedMetadata: true,
            embedThumbnail: true,
            writeThumbnail: true,
            sleepInterval: 10,
            maxSleepInterval: 30,
            //cookies: "cookies-yt.txt",
            writeInfoJson: true,
            dateAfter: "today-21day",
            breakOnReject: true,
        }
        );
        console.log('Channel upload completed:', output);
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function downloadVideo(url, folderName) {
    try {
        const output = await ytdlp.downloadAsync(
        url,
        {
            format: {
                filter: 'mergevideo',
                quality: 'highest',
                format: 'mkv'
            },
            onProgress: (progress) => {
                console.log("video progress", progress.percentage);
            },
            output: "S:/Jellyfin/Youtube/" + folderName + "/%(title)s.%(ext)s",
            embedChapters: true,
            embedInfoJson: true,
            embedSubs: true,
            embedMetadata: true,
            embedThumbnail: true,
            writeThumbnail: true,
            sleepInterval: 10,
            maxSleepInterval: 30,
            //cookies: "cookies-yt.txt",
            writeInfoJson: true,
            breakOnReject: true,
        }
        );
        console.log('Video download completed:', output);
    } catch (error) {
        console.error('Error:', error);
    }
}
