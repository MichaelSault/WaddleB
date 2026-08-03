import fs from "node:fs/promises";
import path from "node:path";

import {
    PLAYLIST_SEASON_DIRECTORY,
    PLAYLIST_SEASON_NUMBER,
} from "./playlist-config.js";

const VIDEO_EXTENSIONS = new Set([".mkv", ".mp4", ".webm"]);

function escapeXml(value) {
    return String(value ?? "").replace(/[<>&'"]/g, character => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        "\"": "&quot;",
    })[character]);
}

async function readEpisodeNumber(nfoPath) {
    try {
        const nfo = await fs.readFile(nfoPath, "utf8");
        const match = nfo.match(/<episode>(\d+)<\/episode>/i);
        return match ? Number(match[1]) : null;
    } catch {
        return null;
    }
}

async function loadVideoRecord(directory) {
    try {
        const files = await fs.readdir(directory);
        const infoJsonFile = files.find(file =>
            file.endsWith(".info.json")
        );

        if (!infoJsonFile) {
            return null;
        }

        const baseName = infoJsonFile.replace(/\.info\.json$/i, "");
        const videoFile = files.find(file =>
            file.startsWith(baseName)
            && VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase())
        );

        if (!videoFile) {
            console.log(`No video found in ${directory}; skipping NFO.`);
            return null;
        }

        const infoPath = path.join(directory, infoJsonFile);
        const nfoPath = path.join(
            directory,
            `${path.parse(videoFile).name}.nfo`
        );

        const info = JSON.parse(await fs.readFile(infoPath, "utf8"));
        const episodeNumber = await readEpisodeNumber(nfoPath);
        const playlistIndex = Number(info.playlist_index);

        return {
            directory,
            info,
            nfoPath,
            episodeNumber,
            playlistIndex: Number.isFinite(playlistIndex)
                ? playlistIndex
                : Number.MAX_SAFE_INTEGER,
        };
    } catch (error) {
        console.error(`Could not inspect ${directory}:`, error);
        return null;
    }
}

// compares episode number as part of sorting process
function compareVideoRecords(first, second) {
    if (first.episodeNumber !== null && second.episodeNumber !== null) {
        return first.episodeNumber - second.episodeNumber;
    }

    if (first.episodeNumber !== null) {
        return -1;
    }

    if (second.episodeNumber !== null) {
        return 1;
    }

    return first.playlistIndex - second.playlistIndex
        || first.directory.localeCompare(second.directory);
}

async function writeEpisodeNfo(record, episodeNumber) {
    const uploadDate = /^\d{8}$/.test(record.info.upload_date)
        ? record.info.upload_date
        : null;

    const premiered = uploadDate
        ? `${uploadDate.slice(0, 4)}-${uploadDate.slice(4, 6)}-${uploadDate.slice(6, 8)}`
        : null;

    const nfo = [
        "<episodedetails>",
        `    <title>${escapeXml(record.info.title)}</title>`,
        `    <originaltitle>${escapeXml(record.info.title)}</originaltitle>`,
        `    <season>${PLAYLIST_SEASON_NUMBER}</season>`,
        `    <episode>${episodeNumber}</episode>`,
        `    <plot>${escapeXml(record.info.description)}</plot>`,
        premiered
            ? `    <premiered>${premiered}</premiered>`
            : null,
        `    <uniqueid type="youtube" default="true">${escapeXml(record.info.id)}</uniqueid>`,
        "</episodedetails>",
    ]
        .filter(Boolean)
        .join("\n");

    try {
        const currentNfo = await fs.readFile(record.nfoPath, "utf8");

        if (currentNfo === nfo) {
            return;
        }
    } catch {
        // The NFO does not exist yet.
    }

    await fs.writeFile(record.nfoPath, nfo, "utf8");
    console.log(`Updated episode ${episodeNumber}: ${record.nfoPath}`);
}

export async function generatePlaylistNfoFiles() {
    const entries = await fs.readdir(
        PLAYLIST_SEASON_DIRECTORY,
        { withFileTypes: true }
    );

    // sorts all videos based on current episode number and removes any gaps from deleted episodes
    const records = (
        await Promise.all(
            entries
                .filter(entry => entry.isDirectory())
                .map(entry => loadVideoRecord(
                    path.join(PLAYLIST_SEASON_DIRECTORY, entry.name)
                ))
        )
    )
    .filter(Boolean)
    .sort(compareVideoRecords);

    // updates the episode number in the NFO
    for (const [index, record] of records.entries()) {
        await writeEpisodeNfo(record, index + 1);
    }
}
