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

/* ---------- Header: mark the section on screen (home page) ---------- */

function header() {
  const bar = document.querySelector<HTMLElement>('[data-op-header]');
  if (!bar) return;

  // Mark the nav cell of the section that fills the middle of the screen.
  const links = new Map<string, HTMLElement>();
  bar.querySelectorAll<HTMLElement>('.op-nav[href^="#"]').forEach((a) => links.set(a.getAttribute('href')!.slice(1), a));
  const sections = ['software', 'films', 'about', 'contact']
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);
  const linkFor = (id: string) => links.get(id === 'films' ? 'software' : id);
  let queued = false;
  const spy = () => {
    queued = false;
    const line = window.innerHeight * 0.4;
    let current = '';
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
    // At the very bottom the footer may never reach the line: it still counts.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = 'contact';
    links.forEach((a) => a.removeAttribute('aria-current'));
    if (current) linkFor(current)?.setAttribute('aria-current', 'true');
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(spy);
      }
    },
    { passive: true },
  );
  spy();
}

/* ---------- Marks: tags write themselves on, stroke by stroke ---------- */

const arm = (m: Element) => {
  (m as SVGElement).dataset.state = 'armed';
};
const draw = (m: Element) => {
  const el = m as SVGElement;
  if (calm()) {
    delete el.dataset.state;
    return;
  }
  // From the start again, even if it was drawn before.
  el.dataset.state = 'armed';
  el.getBoundingClientRect();
  el.dataset.state = 'draw';
};

function marks() {
  document.querySelectorAll('.mark[data-mark="load"]').forEach(draw);
  if (calm() || !('IntersectionObserver' in window)) return;
  const tags = document.querySelectorAll('.mark[data-mark="view"]');
  // Written when its top is a little way up the screen.
  const enter = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting && (e.target as SVGElement).dataset.state !== 'draw') draw(e.target);
    },
    { threshold: 0, rootMargin: '0px 0px -12% 0px' },
  );
  // Hidden again only once no part of it is on screen, so scrolling back a little
  // keeps it; scrolling it fully away and back writes it again.
  const leave = new IntersectionObserver((entries) => {
    for (const e of entries) if (!e.isIntersecting) arm(e.target);
  });
  tags.forEach((m) => {
    enter.observe(m);
    leave.observe(m);
  });
}

/* ---------- Reveals: the logo frames draw their outline ---------- */

function reveals() {
  if (calm() || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('op-in');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.35 },
  );
  document.querySelectorAll('[data-op-reveal]').forEach((r) => io.observe(r));
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

/* ---------- Copy the email address ---------- */

function copyEmail() {
  const wrap = document.querySelector<HTMLElement>('[data-op-mail]');
  const btn = wrap?.querySelector<HTMLButtonElement>('[data-op-copy]');
  const label = document.querySelector<HTMLElement>('[data-op-copy-label]');
  if (!wrap || !btn) return;
  const circle = wrap.querySelector('.op-circle');
  const check = wrap.querySelector('.op-check');
  // The circle shows while the pointer is over the address or it has keyboard focus.
  // It draws once when that starts and hides when both have ended, so dragging out
  // with the button held, or a click leaving focus behind, cannot replay it.
  // The pointer is tracked by its own enter and leave events: :hover sticks to the
  // address while a button is held, even after the pointer has left.
  let shown = false;
  let inside = false;
  const engaged = () => inside || !!wrap.querySelector(':focus-visible');
  const sync = () => {
    if (!circle) return;
    const want = engaged() && wrap.dataset.copied !== '1';
    if (want && !shown) draw(circle);
    if (!want && shown) arm(circle);
    shown = want;
  };
  wrap.addEventListener('pointerenter', () => {
    inside = true;
    sync();
  });
  wrap.addEventListener('pointerleave', () => {
    inside = false;
    sync();
  });
  wrap.addEventListener('focusin', () => requestAnimationFrame(sync));
  wrap.addEventListener('focusout', () => requestAnimationFrame(sync));
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
    sync();
    if (check) draw(check);
    if (label) label.textContent = label.dataset.copied ?? '';
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      wrap.dataset.copied = '0';
      if (check) arm(check);
      sync();
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

header();
marks();
reveals();
loops();
copyEmail();
players();
viewer();
