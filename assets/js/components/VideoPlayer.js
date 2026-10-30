import { $, $$, formatTime, prefersReducedMotion } from '../lib/dom.js';

/* ---------- Fullscreen modal player ---------- */

export function VideoModal() {
  return `
  <div class="vmodal" role="dialog" aria-modal="true" aria-labelledby="vmodal-title" data-vmodal hidden>
    <div class="vmodal__backdrop" data-vclose></div>
    <h2 class="visually-hidden" id="vmodal-title" data-vtitle>Video</h2>
    <div class="vmodal__stage" data-vstage>
      <video class="vmodal__video" playsinline preload="none" data-vvideo></video>
    </div>
    <div class="vmodal__bar">
      <button class="vbtn" type="button" data-vtoggle>Pause</button>
      <span class="vmodal__time meta" aria-live="off"><span data-vcur>00:00</span> / <span data-vdur>00:00</span></span>
      <label class="visually-hidden" for="vmodal-seek">Seek</label>
      <input class="vmodal__seek" id="vmodal-seek" type="range" min="0" max="1000" step="1" value="0" data-vseek>
      <button class="vbtn" type="button" data-vmute>Mute</button>
    </div>
    <button class="vmodal__close vbtn" type="button" data-vclose-btn aria-label="Close video">Close</button>
  </div>`;
}

export function initVideoModal() {
  const modal = $('[data-vmodal]');
  if (!modal) return;
  const video = $('[data-vvideo]', modal);
  const stage = $('[data-vstage]', modal);
  const toggle = $('[data-vtoggle]', modal);
  const mute = $('[data-vmute]', modal);
  const seek = $('[data-vseek]', modal);
  const cur = $('[data-vcur]', modal);
  const dur = $('[data-vdur]', modal);
  const titleEl = $('[data-vtitle]', modal);
  const closeBtn = $('[data-vclose-btn]', modal);
  let opener = null;
  let seeking = false;

  const sync = () => {
    toggle.textContent = video.paused ? 'Play' : 'Pause';
    mute.textContent = video.muted ? 'Sound on' : 'Mute';
    mute.setAttribute('aria-pressed', String(!video.muted));
  };

  const open = (trigger) => {
    opener = trigger;
    const [w, h] = (trigger.dataset.videoRatio || '16/9').split('/').map(Number);
    stage.style.setProperty('--ratio', `${w} / ${h}`);
    stage.classList.toggle('is-portrait', h > w);
    titleEl.textContent = trigger.dataset.videoTitle || 'Video';
    video.poster = trigger.dataset.videoPoster || '';
    video.src = trigger.dataset.openVideo;
    // Opening is a click, so playing with sound is the viewer's choice.
    video.muted = trigger.dataset.videoSound !== 'true';
    $$('video').forEach((v) => { if (v !== video) v.pause(); });

    modal.hidden = false;
    document.documentElement.classList.add('modal-open');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    video.play().catch(() => { video.muted = true; video.play().catch(() => {}); }).finally(sync);
    closeBtn.focus({ preventScroll: true });
  };

  const close = () => {
    if (modal.hidden) return;
    modal.classList.remove('is-open');
    video.pause();
    document.documentElement.classList.remove('modal-open');
    const done = () => {
      modal.hidden = true;
      video.removeAttribute('src');
      video.load();
      // Let the page resume its own loops.
      window.dispatchEvent(new Event('ttm:modal-closed'));

    };
    window.setTimeout(done, prefersReducedMotion() ? 0 : 450);
    if (opener) opener.focus({ preventScroll: true });
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-video]');
    if (trigger) { e.preventDefault(); open(trigger); }
  });
  $$('[data-vclose], [data-vclose-btn]', modal).forEach((el) => el.addEventListener('click', close));
  video.addEventListener('click', () => (video.paused ? video.play() : video.pause()));

  toggle.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  mute.addEventListener('click', () => { video.muted = !video.muted; sync(); });
  ['play', 'pause', 'volumechange'].forEach((ev) => video.addEventListener(ev, sync));

  video.addEventListener('loadedmetadata', () => { dur.textContent = formatTime(video.duration); });
  video.addEventListener('timeupdate', () => {
    cur.textContent = formatTime(video.currentTime);
    if (!seeking && video.duration) {
      const p = (video.currentTime / video.duration) * 1000;
      seek.value = String(p);
      seek.style.setProperty('--p', `${p / 10}%`);
    }
  });
  video.addEventListener('ended', sync);
  seek.addEventListener('input', () => {
    seeking = true;
    seek.style.setProperty('--p', `${seek.value / 10}%`);
    if (video.duration) video.currentTime = (seek.value / 1000) * video.duration;
  });
  seek.addEventListener('change', () => { seeking = false; });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === ' ' && e.target === modal) { e.preventDefault(); video.paused ? video.play() : video.pause(); }
    if (e.key !== 'Tab') return;
    // Keep focus inside the dialog.
    const items = $$('button, input', modal).filter((el) => !el.disabled && el.offsetParent !== null);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
