(() => {
  const data = window.__DATA__;
  const video = document.querySelector('video.html5-main-video');
  const player = document.querySelector('#movie_player');
  const skip = document.querySelector('.ytp-skip-ad-button');
  const bar = document.querySelector('#bar');
  const playBtn = document.querySelector('.ytp-play-button');
  const toggle = document.querySelector('.ytp-autonav-toggle-button');
  const log = [];
  window.__yt = { log };

  const breaks = (data.breaks || []).map(b => ({ ...b, done: false }));
  const s = { mode: 'content', content: 0, adTime: 0, pod: [], adIndex: 0, paused: Boolean(data.startPaused), ended: false };
  const ad = () => s.pod[s.adIndex];
  const current = () => (s.mode === 'ad' ? s.adTime : s.content);
  const duration = () => (s.mode === 'ad' ? ad().length : data.duration);

  const def = (name, get, set) => Object.defineProperty(video, name, { get, set: set || (v => log.push({ t: 'tamper', name, v })), configurable: true });
  const t0 = performance.now();
  def('currentTime', () => (data.staleCurrent != null && performance.now() - t0 < 400 ? data.staleCurrent : current()));
  def('duration', duration);
  def('paused', () => s.paused, () => {});
  def('ended', () => s.ended, () => {});
  def('readyState', () => 4, () => {});
  def('playbackRate', () => 1);
  def('muted', () => false);
  video.play = async () => { s.paused = false; };
  video.pause = () => { s.paused = true; };

  playBtn.addEventListener('click', e => { log.push({ t: 'play-click', trusted: e.isTrusted }); s.paused = !s.paused; });
  toggle.addEventListener('click', e => {
    log.push({ t: 'autonav-click', trusted: e.isTrusted });
    if (!data.autonavStuck) toggle.setAttribute('aria-checked', String(toggle.getAttribute('aria-checked') !== 'true'));
  });
  const like = document.querySelector('like-button-view-model button');
  like.addEventListener('click', e => {
    log.push({ t: 'like-click', trusted: e.isTrusted, was: like.getAttribute('aria-pressed') });
    like.setAttribute('aria-pressed', String(like.getAttribute('aria-pressed') !== 'true'));
  });
  skip.addEventListener('click', e => {
    log.push({ t: 'skip-click', trusted: e.isTrusted, ad: s.adIndex });
    if (s.mode === 'ad') endAd();
  });
  document.addEventListener('click', e => {
    const link = e.target.closest && e.target.closest('a[href]');
    if (link) log.push({ t: 'link-click', href: link.getAttribute('href'), trusted: e.isTrusted });
  }, true);

  const startAd = pod => { s.mode = 'ad'; s.pod = pod; s.adIndex = 0; s.adTime = 0; player.classList.add('ad-showing'); };
  const endAd = () => {
    s.adIndex += 1;
    s.adTime = 0;
    if (s.adIndex < s.pod.length) return;
    s.mode = 'content';
    player.classList.remove('ad-showing');
  };

  const render = () => {
    const showSkip = s.mode === 'ad' && ad().skipAfter != null && s.adTime >= ad().skipAfter;
    skip.hidden = !showSkip;
    bar.style.width = `${(s.content / data.duration) * 100}%`;
  };

  let last = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = ((now - last) / 1000) * data.timeScale;
    last = now;
    if (s.paused || s.ended) return render();
    if (s.mode === 'ad') {
      s.adTime += dt;
      if (s.adTime >= ad().length) endAd();
    } else {
      const due = breaks.find(b => !b.done && s.content >= b.at);
      if (due) { due.done = true; startAd(due.ads); }
      else if (data.stallAt == null || s.content < data.stallAt) s.content = Math.min(data.duration, s.content + dt);
      if (s.content >= data.duration) finish();
    }
    render();
  }, 20);

  const finish = () => {
    if (s.ended) return;
    s.ended = true;
    log.push({ t: 'ended' });
    if (data.autoplayTo && toggle.getAttribute('aria-checked') === 'true') {
      setTimeout(() => location.assign(`/watch?v=${data.autoplayTo}`), data.autoplayDelayMs ?? 300);
    }
  };

  window.__yt.state = () => ({ ...s, rate: video.playbackRate });
})();
