/**
 * Shared by the server preload link and the client poster so both request the same file.
 * Phones play the 720p video, so their poster is the 720 rendition too: a half-width
 * hint keeps that choice on every pixel density.
 */
export const HERO_POSTER_SIZES = "(max-width: 767px) 50vw, 100vw";
