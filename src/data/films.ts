// The two films: files, sizes and Breakdown frames. Copy lives in src/i18n.
// Frames are at 24 fps; the timecode shown on the site is worked out from them.

export interface Film {
  key: 'hoplite' | 'bridgemind';
  name: string;
  frames: number; // total length in frames
  width: number;
  height: number;
  ratio: string; // CSS aspect-ratio
  hasSound: boolean;
  film: string; // player file in R2
  loop: string; // home page loop in R2
  poster: string; // in public/
  posterWidth: number;
  posterHeight: number;
  shots: { frame: number; image: string }[];
}

export const films: Record<Film['key'], Film> = {
  hoplite: {
    key: 'hoplite',
    name: 'Hoplite',
    frames: 784,
    width: 3840,
    height: 2160,
    ratio: '16 / 9',
    hasSound: true,
    film: 'hoplite-1080.mp4',
    loop: 'hoplite-loop-720.mp4',
    poster: '/images/hoplite-poster.jpg',
    posterWidth: 1920,
    posterHeight: 1080,
    shots: [
      { frame: 110, image: '/images/hoplite-shot-0-00-04-14.jpg' },
      { frame: 294, image: '/images/hoplite-shot-0-00-12-06.jpg' },
      { frame: 672, image: '/images/hoplite-shot-0-00-28-00.jpg' },
    ],
  },
  bridgemind: {
    key: 'bridgemind',
    name: 'BridgeMind',
    frames: 720,
    width: 2160,
    height: 2160,
    ratio: '1 / 1',
    hasSound: false,
    film: 'bridgemind-1080.mp4',
    loop: 'bridgemind-loop-720.mp4',
    poster: '/images/bridgemind-poster.jpg',
    posterWidth: 1440,
    posterHeight: 1440,
    shots: [
      { frame: 168, image: '/images/bridgemind-shot-0-00-07-00.jpg' },
      { frame: 312, image: '/images/bridgemind-shot-0-00-13-00.jpg' },
      { frame: 600, image: '/images/bridgemind-shot-0-00-25-00.jpg' },
    ],
  },
};
