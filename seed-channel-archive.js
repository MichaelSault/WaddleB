import fs from "node:fs";
import path from "node:path";

import { channels } from "./channels.js";

const YOUTUBE_DIRECTORY = "J:/Youtube";

const ARCHIVE_FILE = path.join(
    process.cwd(),
    "data",
    "channel-download-archive.txt"
);

const VIDEO_EXTENSIONS = new Set([
    ".mkv",
    ".mp4",
    ".webm",
]);

function findInfoJsonFiles(directory) {
    return fs.readdirSync(directory, {
        withFileTypes: true,
    }).flatMap(entry => {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            return findInfoJsonFiles(entryPath);
        }

        if (
            entry.isFile()
            && entry.name.endsWith(".info.json")
        ) {
            return [entryPath];
        }

        return [];
    });
}

function hasMatchingVideo(jsonPath) {
    const directory = path.dirname(jsonPath);
    const jsonName = path.basename(jsonPath);
    const baseName = jsonName.replace(/\.info\.json$/i, "");

    return fs.readdirSync(directory).some(fileName => {
        const extension = path.extname(fileName).toLowerCase();
        const videoName = path.parse(fileName).name;

        return videoName === baseName
            && VIDEO_EXTENSIONS.has(extension);
    });
}

fs.mkdirSync(path.dirname(ARCHIVE_FILE), {
    recursive: true,
});

const existingArchive = fs.existsSync(ARCHIVE_FILE)
    ? fs.readFileSync(ARCHIVE_FILE, "utf8")
    : "";

const archivedEntries = new Set(
    existingArchive
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
);

const newEntries = [];

for (const channel of channels) {
    const channelDirectory = path.join(
        YOUTUBE_DIRECTORY,
        channel.folder
    );

    if (!fs.existsSync(channelDirectory)) {
        console.warn(
            `Channel folder not found; skipping: ${channelDirectory}`
        );
        continue;
    }

    let channelEntries = 0;

    for (const jsonPath of findInfoJsonFiles(channelDirectory)) {
        if (!hasMatchingVideo(jsonPath)) {
            continue;
        }

        try {
            const info = JSON.parse(
                fs.readFileSync(jsonPath, "utf8")
            );

            if (!info.id) {
                console.warn(
                    `No YouTube ID found; skipping: ${jsonPath}`
                );
                continue;
            }

            const archiveEntry = `youtube ${info.id}`;

            if (archivedEntries.has(archiveEntry)) {
                continue;
            }

            archivedEntries.add(archiveEntry);
            newEntries.push(archiveEntry);
            channelEntries += 1;
        } catch (error) {
            console.warn(
                `Could not read metadata; skipping: ${jsonPath}`,
                error.message
            );
        }
    }

    console.log(
        `${channel.folder}: added ${channelEntries} archive entries.`
    );
}

if (newEntries.length > 0) {
    const needsLeadingNewline =
        existingArchive.length > 0
        && !existingArchive.endsWith("\n");

    fs.appendFileSync(
        ARCHIVE_FILE,
        `${needsLeadingNewline ? "\n" : ""}`
        + `${newEntries.join("\n")}\n`,
        "utf8"
    );
}

console.log(
    `Channel archive seeding complete. Added ${newEntries.length} entries.`
);
