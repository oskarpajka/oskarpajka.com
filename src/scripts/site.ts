// Everything that moves or reacts on the site. Runs once per page.
// No cookies, no storage, nothing is sent anywhere.

const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const timecode = (frame: number) => {
  const two = (n: number) => String(n).padStart(2, '0');
  const s = Math.floor(frame / 24);
  return `${Math.floor(s / 3600)}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}:${two(frame % 24)}`;
};
const frameOf = (v: HTMLVideoElement) => Math.floor(v.currentTime * 24 + 0.001);
const quietPlay = (v: HTMLVideoElement) => {
  const p = v.play();
  if (p) p.catch(() => {});
};

/* ---------- Pinned header ---------- */

function pinnedHeader() {
  const pin = document.querySelector<HTMLElement>('[data-op-pin]');
  // On the home page the header pins once the whole landing section is gone;
  // on other pages, as soon as the page's own header has scrolled away.
  const head = document.querySelector('[data-op-pin-after]') ?? document.getElementById('top');
  if (!pin || !head || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(
    ([entry]) => {
      pin.dataset.on = entry.isIntersecting ? '0' : '1';
    },
    // The pinned header covers the top 57px, so anything under it counts as gone.
    { threshold: 0, rootMargin: '-57px 0px 0px 0px' },
  ).observe(head);
}

/* ---------- Marks: replay their wipe when they come into view ---------- */

function marks() {
  if (calm() || !('IntersectionObserver' in window)) return;
  const groups = new Map<Element, Element[]>();
  document.querySelectorAll('[data-op-reveal]').forEach((m) => {
    const parent = m.parentElement;
    if (!parent) return;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent)!.push(m);
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        groups.get(e.target)?.forEach((m) => m.classList.add('op-in'));
        io.unobserve(e.target);
      }
    },
    { threshold: 0 },
  );
  groups.forEach((_, parent) => io.observe(parent));
}

/* ---------- Home: loops that play while half on screen ---------- */

function loops() {
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-op-loop]');
  if (!vids.length) return;
  const chipOf = (v: HTMLVideoElement) => v.parentElement?.querySelector<HTMLElement>('[data-op-tc]') ?? null;
  const reset = (v: HTMLVideoElement) => {
    const chip = chipOf(v);
    if (chip) chip.textContent = timecode(0);
  };
  const tick = () => {
    vids.forEach((v) => {
      if (v.paused || v.readyState < 1) return;
      const chip = chipOf(v);
      if (chip) chip.textContent = timecode(frameOf(v));
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              const v = e.target as HTMLVideoElement;
              if (e.isIntersecting) {
                if (!calm() && v.dataset.held !== '1') quietPlay(v);
              } else {
                v.pause();
                reset(v);
              }
            }
          },
          { threshold: 0.5 },
        )
      : null;

  vids.forEach((v) => {
    v.muted = true;
    io?.observe(v);
    v.addEventListener('click', () => {
      if (v.paused) {
        v.dataset.held = '0';
        quietPlay(v);
      } else {
        v.dataset.held = '1';
        v.pause();
      }
    });
    v.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        v.click();
      }
    });
  });
}

/* ---------- Image comparison ---------- */

function compare() {
  document.querySelectorAll<HTMLElement>('[data-op-compare]').forEach((box) => {
    const input = box.querySelector<HTMLInputElement>('input');
    const cut = box.querySelector<HTMLElement>('.op-cut');
    const bar = box.querySelector<HTMLElement>('.op-bar-line');
    if (!input || !cut || !bar) return;
    const set = () => {
      const v = Number(input.value);
      cut.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
      bar.style.left = `${v}%`;
    };
    input.addEventListener('input', set);
    set();
  });
}

/* ---------- Copy the email address ---------- */

function copyEmail() {
  const wrap = document.querySelector<HTMLElement>('[data-op-mail]');
  const btn = wrap?.querySelector<HTMLButtonElement>('[data-op-copy]');
  const label = document.querySelector<HTMLElement>('[data-op-copy-label]');
  if (!wrap || !btn) return;
  let timer = 0;
  btn.addEventListener('click', async () => {
    const email = btn.dataset.opCopy!;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // No clipboard (old browser or blocked): open the mail app instead.
      window.location.href = `mailto:${email}`;
      return;
    }
    wrap.dataset.copied = '1';
    if (label) label.textContent = label.dataset.copied ?? '';
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      wrap.dataset.copied = '0';
      if (label) label.textContent = label.dataset.copy ?? '';
    }, 2000);
  });
}

/* ---------- Project pages: the film player ---------- */

function players() {
  document.querySelectorAll<HTMLElement>('[data-op-player]').forEach((player) => {
    const v = player.querySelector<HTMLVideoElement>('video')!;
    const stage = player.querySelector<HTMLButtonElement>('.op-stage')!;
    const play = player.querySelector<HTMLButtonElement>('[data-op-play]')!;
    const mute = player.querySelector<HTMLButtonElement>('[data-op-mute]');
    const fs = player.querySelector<HTMLButtonElement>('[data-op-fs]')!;
    const range = player.querySelector<HTMLInputElement>('.op-range')!;
    const fill = player.querySelector<HTMLElement>('.op-fill')!;
    const head = player.querySelector<HTMLElement>('.op-playhead')!;
    const tc = player.querySelector<HTMLElement>('[data-op-tc]')!;
    const total = Number(player.dataset.frames);
    const l = player.dataset;
    let last = -1;

    const paint = () => {
      const f = Math.min(frameOf(v), total);
      if (f !== last) {
        last = f;
        const pct = `${(f / total) * 100}%`;
        fill.style.width = pct;
        head.style.left = pct;
        range.value = String(f);
        range.setAttribute('aria-valuetext', timecode(f));
        tc.textContent = timecode(f);
      }
      if (!v.paused) requestAnimationFrame(paint);
    };
    const toggle = () => {
      if (v.paused) {
        if (v.ended) v.currentTime = 0;
        quietPlay(v);
      } else v.pause();
    };
    const toggleMute = () => {
      if (!mute) return;
      v.muted = !v.muted;
      mute.textContent = v.muted ? l.unmute! : l.mute!;
    };
    const toggleFs = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if (player.requestFullscreen) {
        player.requestFullscreen().catch(() => {});
      } else {
        // iPhone Safari only allows the video itself to go full screen.
        (v as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
      }
    };

    stage.addEventListener('click', toggle);
    play.addEventListener('click', toggle);
    mute?.addEventListener('click', toggleMute);
    fs.addEventListener('click', toggleFs);
    range.addEventListener('input', () => {
      v.currentTime = Number(range.value) / 24;
      paint();
    });
    v.addEventListener('play', () => {
      play.textContent = l.pause!;
      requestAnimationFrame(paint);
    });
    v.addEventListener('pause', () => {
      play.textContent = l.play!;
      paint();
    });
    v.addEventListener('seeked', paint);
    v.addEventListener('loadedmetadata', paint);
    document.addEventListener('fullscreenchange', () => {
      fs.textContent = document.fullscreenElement === player ? l.exitFs! : l.fs!;
      if (!document.fullscreenElement) player.classList.remove('op-idle');
    });

    // Keys while the player has focus: space plays, M mutes, F goes full screen.
    player.addEventListener('keydown', (e) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === 'm' || e.key === 'M') toggleMute();
      else if (e.key === 'f' || e.key === 'F') toggleFs();
      else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') {
        e.preventDefault();
        toggle();
      }
    });

    // Hide the controls in full screen after 2 seconds without the mouse moving.
    let idle = 0;
    player.addEventListener('mousemove', () => {
      player.classList.remove('op-idle');
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (document.fullscreenElement === player) player.classList.add('op-idle');
      }, 2000);
    });

    // Breakdown stills jump the film to their frame and play from there.
    document.querySelectorAll<HTMLButtonElement>('[data-op-frame]').forEach((btn) => {
      btn.addEventListener('click', () => {
        v.currentTime = Number(btn.dataset.opFrame) / 24;
        quietPlay(v);
        player.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
        stage.focus({ preventScroll: true });
      });
    });
  });
}

/* ---------- Large image view ---------- */

function viewer() {
  const dialog = document.querySelector<HTMLDialogElement>('dialog[data-op-viewer]');
  if (!dialog) return;
  const items = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-op-zoom]'));
  const img = dialog.querySelector<HTMLImageElement>('[data-op-view-img]')!;
  const cap = dialog.querySelector<HTMLElement>('[data-op-view-caption]')!;
  const count = dialog.querySelector<HTMLElement>('[data-op-view-count]')!;
  let index = 0;
  let touchX: number | null = null;

  const show = (i: number) => {
    index = (i + items.length) % items.length;
    const from = items[index].querySelector('img')!;
    img.src = from.currentSrc || from.src;
    img.alt = from.alt;
    cap.textContent = items[index].dataset.caption ?? '';
    count.textContent = `${index + 1} / ${items.length}`;
  };
  const close = () => dialog.close();

  items.forEach((btn, i) =>
    btn.addEventListener('click', () => {
      show(i);
      dialog.showModal();
    }),
  );
  dialog.querySelector('[data-op-prev]')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-op-next]')?.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-op-close]')?.addEventListener('click', close);
  dialog.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === dialog || t.hasAttribute('data-op-view-area')) close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1);
    }
  });
  dialog.addEventListener('touchstart', (e) => (touchX = e.touches[0]?.clientX ?? null), { passive: true });
  dialog.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    if (!t || touchX === null) return;
    const dx = t.clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 48) show(index + (dx < 0 ? 1 : -1));
  });
}

pinnedHeader();
marks();
loops();
compare();
copyEmail();
players();
viewer();
