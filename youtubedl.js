import { format } from 'path';
import * as path from 'path';
import { YtDlp } from 'ytdlp-nodejs';
import * as fs from 'fs';

const ytdlp = new YtDlp();

export async function downloadNew(channel, folder) {
    const url = "https://www.youtube.com/@"+ channel;
    const baseDir = "J:/Youtube/" + folder;

    //log files before the download
    const before = new Set(fs.readdirSync(baseDir));

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
                console.log(channel + " video progress", progress.percentage);
            },
            output: "J:/Youtube/" + folder + "/%(title)s.%(ext)s",
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
            dateAfter: "today-410day",
            breakOnReject: true,
            verbose: true
        }
        );
        console.log('Channel update completed:', output);

    } catch (error) {
        if (error.message?.includes("code 101")) {
            console.log('Error: No new videos found for this channel.');
        } else {
            console.error('Error:', error);
        }
    } finally {
        const after = new Set(fs.readdirSync(baseDir));
        const newFiles = [...after].filter(f => !before.has(f));

        try {
            await generateNFO(folder, newFiles);
        } catch (error){
            console.error("Failed to generate NFO files:", error);
        }
        
    }
}

export async function generateNFO (folder) {
    //now generate .nfo files for each video
    const baseDir = "J:/Youtube/" + folder;

    //Find ALL .info.json files in the folder 
    const allFiles = fs.readdirSync(baseDir); 
    const allJSONs = allFiles.filter(f => f.endsWith(".info.json")); 
    // Only generate NFOs for videos that don't already have one

    const missingNFOs = allJSONs.filter(jsonFile => { 
        const baseName = jsonFile.replace(".info.json", ""); 
        const nfoPath = path.join(baseDir, baseName + ".nfo"); 
        return !fs.existsSync(nfoPath); 
    });

    if (missingNFOs.length === 0) {
        console.log("No new NFO files to generate.");
        return;
    }

    for (const file of missingNFOs) {
        const jsonPath = path.join(baseDir, file);
        const info = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        const title = info.title;
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, "");
        const id = info.id;
        const description = info.description || "";

        console.log(title);

        //get the upload date to use as season and episode numbers
        let uploadDate = info.upload_date;

        const season = uploadDate.slice(0, 4); 
        const monthDay = uploadDate.slice(4, 8); 
        const episode = 1232 - Number(monthDay);

        if (!/^\d{8}$/.test(uploadDate)) {
            const now = new Date(); 
            uploadDate = now.toISOString().slice(0,10).replace(/-/g,""); 
        }

        const premiered = `${uploadDate.slice(0,4)}-${uploadDate.slice(4,6)}-${uploadDate.slice(6,8)}`;

        function escapeXml(str) { 
            return (str || "").replace(/[<>&'"]/g, c => ({
                "<": "&lt;",
                ">": "&gt;", 
                "&": "&amp;", 
                "'": "&apos;", 
                '"': "&quot;" 
            }[c]));
        }

        // Find the actual video filename 
        const baseName = file.replace(".info.json", ""); 
        const videoFile = allFiles.find(f => 
            f.startsWith(baseName) && (f.endsWith(".mkv") || f.endsWith(".mp4") || f.endsWith(".webm")) 
        ); 
        
        if (!videoFile) { 
            console.log(`No matching video file found for ${file}, skipping.`); 
            continue; 
        }

        const nfoName = videoFile.replace(path.extname(videoFile), ".nfo");


        const nfo = ` 
            <episodedetails> 
                <title>${escapeXml(title)}</title> 
                <originaltitle>${escapeXml(title)}</originaltitle>
                <season>${season}</season>
                <episode>${episode}</episode> 
                <plot>${escapeXml(description)}</plot> 
                <premiered>${premiered}</premiered> 
                <uniqueid type="youtube" default="true">${id}</uniqueid>
            </episodedetails> `
        .trim();

        fs.writeFileSync(baseDir + `/${nfoName}`, nfo);
        console.log(`Created NFO for: ${nfoName}`);
        
    }
    console.log("All NFO files created successfully.");
}

export async function downloadVideo(url) {
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
            output: "X:/Downloads/" + "%(title)s.%(ext)s",
            embedChapters: true,
            embedInfoJson: true,
            embedSubs: true,
            embedMetadata: true,
            embedThumbnail: true,
            writeThumbnail: true,
            sleepInterval: 10,
            maxSleepInterval: 30,
            cookies: "cookies-yt.txt",
            writeInfoJson: true,
            breakOnReject: true,
        }
        );
        console.log('Video download completed:', output);
    } catch (error) {
        console.error('Error:', error);
    }
}


export async function downloadPlaylists(url) {
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
            output: "X:/Youtube/Riley Rehl" + "/%(playlist_title)s/%(playlist_index)s - %(title)s.%(ext)s",
            embedChapters: true,
            embedInfoJson: true,
            embedSubs: true,
            embedMetadata: true,
            embedThumbnail: true,
            writeThumbnail: true,
            sleepInterval: 10,
            maxSleepInterval: 30,
            cookies: "cookies-yt.txt",
            writeInfoJson: true,
            breakOnReject: true,
        }
        );
        console.log('Video download completed:', output);
    } catch (error) {
        console.error('Error:', error);
    }
}
