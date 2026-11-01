// First frame of the user-accepted Google Flow A→B clip. The desktop poster,
// portrait crop and scroll frames share the source in cinematic-hero.json.
export const cinematicPoster = {
  src: "/frames/afina-agac-dal/poster-desktop.webp",
  width: 1280,
  height: 720,
  mobileSrcSet: "/frames/afina-agac-dal/poster-mobile.avif 480w",
  mobileWebpSrcSet: "/frames/afina-agac-dal/poster-mobile.webp 480w",
  desktopSrcSet: "/frames/afina-agac-dal/poster-desktop.avif 1280w",
  desktopWebpSrcSet: "/frames/afina-agac-dal/poster-desktop.webp 1280w",
};

// A landscape media window uses the same full frame at every breakpoint.
export const editorialPoster = {
  ...cinematicPoster,
  mobileSrcSet: cinematicPoster.desktopSrcSet,
  mobileWebpSrcSet: cinematicPoster.desktopWebpSrcSet,
};

// Native full-bleed film uses the complete first frame on every screen, so
// CSS can keep the same 70% mobile focal point in both poster and movie.
export const cinematicFilmPoster = editorialPoster;
