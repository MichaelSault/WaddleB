import {
    JELLYFIN_API_KEY,
    JELLYFIN_PLAYLIST_DIRECTORY,
    JELLYFIN_URL,
    JELLYFIN_USER_ID,
    validatePlaylistConfiguration,
} from "./playlist-config.js";

function normalizePath(filePath) {
    return filePath
        .replaceAll("\\", "/")
        .replace(/\/+$/, "")
        .toLowerCase();
}

function isWatchLaterPath(filePath) {
    const normalizedPath = normalizePath(filePath);
    const normalizedRoot = normalizePath(JELLYFIN_PLAYLIST_DIRECTORY);

    return normalizedPath === normalizedRoot
        || normalizedPath.startsWith(`${normalizedRoot}/`);
}

function extractYouTubeId(filePath) {
    const match = filePath.match(/\[([a-zA-Z0-9_-]{11})\]/);
    return match?.[1] ?? null;
}

export async function getWatchedPlaylistItems() {
    validatePlaylistConfiguration();

    const query = new URLSearchParams({
        Recursive: "true",
        IncludeItemTypes: "Episode",
        Fields: "Path",
        EnableUserData: "true",
    });

    const endpoint =
        `${JELLYFIN_URL}/Users/${encodeURIComponent(JELLYFIN_USER_ID)}/Items?${query}`;

    const response = await fetch(endpoint, {
        headers: {
            "X-Emby-Token": JELLYFIN_API_KEY,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Jellyfin request failed with status ${response.status}`
        );
    }

    const result = await response.json();

    return (result.Items ?? [])
        .filter(item =>
            item.Path
            && isWatchLaterPath(item.Path)
            && item.UserData?.Played === true
            && item.UserData.LastPlayedDate
        )
        .map(item => ({
            jellyfinItemId: item.Id,
            youtubeId: extractYouTubeId(item.Path),
            path: item.Path,
            lastPlayedDate: item.UserData.LastPlayedDate,
        }))
        .filter(item => item.youtubeId !== null);
}
