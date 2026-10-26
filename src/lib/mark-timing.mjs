// When each traced segment of a marker tag starts and how long it takes.
// Shared by Mark.astro (the site) and scripts/build-og.mjs (the link preview videos),
// so a tag writes the same way in both.

const LIFT = 45; // pen lift between strokes, ms

/**
 * @param {{ strokes: { len: number, s: number, g: number }[] }} mark  an entry of src/data/strokes.json
 * @param {{ name: string, order?: 'written' | 'letters', dur?: number, stagger?: number, delay?: number }} options
 *   'written': one stroke after another, in painting order, over `dur` ms.
 *   'letters': the letters start in a shuffled order, `stagger` ms apart, and overlap;
 *   each letter takes about `dur` ms.
 * @returns {{ timed: { seg: any, d: number, t: number }[], end: number }}
 */
export function timeMark(mark, { name, order = 'written', dur = 1200, stagger = 110, delay = 0 }) {
  const byStroke = new Map();
  for (const seg of mark.strokes) byStroke.set(seg.s, [...(byStroke.get(seg.s) ?? []), seg]);
  const strokeList = [...byStroke.values()];
  const lengthOf = (segs) => segs.reduce((n, s) => n + s.len, 0);

  // The pen starts and ends a stroke slowly. Each segment's start and end time comes
  // from the inverse of a sine ease, so the pieces join into one eased stroke.
  const easeBack = (u) => Math.acos(1 - 2 * Math.min(1, Math.max(0, u))) / Math.PI;
  const timed = [];
  const place = (segs, start, time) => {
    const total = lengthOf(segs);
    let run = 0;
    for (const seg of segs) {
      const a = start + time * easeBack(run / total);
      run += seg.len;
      const b = start + time * easeBack(run / total);
      timed.push({ seg, d: Math.round(a), t: Math.max(1, Math.round(b - a)) });
    }
  };
  // Strokes one after another from `start`, sharing `time`; returns when the last ends.
  const write = (list, start, time) => {
    const total = list.reduce((n, segs) => n + lengthOf(segs), 0);
    const draw = Math.max(time - LIFT * (list.length - 1), list.length * 60);
    let at = start;
    for (const segs of list) {
      const t = Math.max(60, (draw * lengthOf(segs)) / total);
      place(segs, at, t);
      at += t + LIFT;
    }
    return at - LIFT;
  };

  let end;
  if (order === 'letters') {
    const letters = new Map();
    for (const segs of strokeList) letters.set(segs[0].g, [...(letters.get(segs[0].g) ?? []), segs]);
    const keys = [...letters.keys()];
    // Same shuffle on every build, so the tag always writes the same way.
    let seed = [...name].reduce((n, c) => n * 31 + c.charCodeAt(0), 7) >>> 0;
    const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    const mean = keys.reduce((n, k) => n + letters.get(k).reduce((m, s) => m + lengthOf(s), 0), 0) / keys.length;
    end = delay;
    keys.forEach((k, rank) => {
      const list = letters.get(k);
      const scale = Math.min(1.3, Math.max(0.7, list.reduce((m, s) => m + lengthOf(s), 0) / mean));
      end = Math.max(end, write(list, delay + rank * stagger, dur * scale));
    });
  } else {
    end = write(strokeList, delay, dur);
  }
  return { timed, end: Math.round(end) };
}
