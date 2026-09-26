// icons shared by the slider and the lightbox
const ICONS = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
  zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M8 10.5h5M10.5 8v5"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>'
};


// main navigation (burger menu on small screens)
(function () {
  const toggle = document.getElementById('toggle-nav');
  const nav = document.querySelector('nav.main');
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });
})();


// recipe search on /gegrillt/: filters the teasers by title, description and
// tags; runs as a view transition, so cards shrink away and the rest glides
// to their new place (see _common.scss)
(function () {
  const list = document.querySelector('[data-component="recipe-list"]');
  const form = document.querySelector('[data-component="form-recipe-search"]');
  if (!list || !form) {
    return;
  }

  const input = form.querySelector('[data-component="search-term"]');
  const noResults = list.querySelector('[data-component="no-results-message"]');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timeout;

  const items = Array.from(list.querySelectorAll('[data-component="recipe-teaser"]')).map((el, i) => {
    el.style.viewTransitionName = 'recipe-' + i;
    return {el, text: searchableText(el.dataset.tags + ' ' + el.textContent)};
  });

  function searchableText(text) {
    return text
      .replace(/­/g, '') // soft hyphen
      .replace(/[ \s]+/g, ' ') // non-breaking space, tabs, line breaks
      .replace(/…/g, '...') // horizontal ellipsis
      .toLowerCase();
  }

  function filter() {
    const term = searchableText(input.value).trim();
    const update = () => {
      let count = 0;
      items.forEach(item => {
        item.el.hidden = !item.text.includes(term);
        count += item.el.hidden ? 0 : 1;
      });
      noResults.classList.toggle('d-none', count > 0);
    };

    if (document.startViewTransition && !calm) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  form.addEventListener('submit', e => e.preventDefault());
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(filter, 200);
  });
})();


// image sliders (recipe pages): a scroll-snap strip (see _slider.scss); the
// arrows move by one image and wrap around at both ends
(function () {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.slider').forEach(slider => {
    const frame = document.createElement('div');
    frame.className = 'slider-frame';
    slider.parentNode.insertBefore(frame, slider);
    frame.appendChild(slider);

    const prev = button('slider-prev', 'Vorheriges Bild', -1);
    const next = button('slider-next', 'Nächstes Bild', 1);
    frame.appendChild(prev);
    frame.appendChild(next);

    function button(className, label, direction) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = className;
      el.setAttribute('aria-label', label);
      el.innerHTML = ICONS.arrow;
      el.addEventListener('click', () => move(direction));
      return el;
    }

    function move(direction) {
      const max = slider.scrollWidth - slider.clientWidth;
      const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;
      const step = slider.firstElementChild.getBoundingClientRect().width + gap;
      let left = slider.scrollLeft + direction * step;
      if (direction > 0 && slider.scrollLeft >= max - 2) {
        left = 0;
      } else if (direction < 0 && slider.scrollLeft <= 2) {
        left = max;
      }
      slider.scrollTo({left, behavior: calm ? 'auto' : 'smooth'});
    }

    // no arrows when all images fit
    new ResizeObserver(() => {
      prev.hidden = next.hidden = slider.scrollWidth <= slider.clientWidth + 1;
    }).observe(slider);
  });
})();


// lightbox for images linked with data-lightbox: links sharing the same value
// form a gallery (arrows, counter, swipe), an empty value shows a single image.
// Opens zooming out of the thumbnail and closes back into it; a click on the
// image (or the zoom button) shows it at full size.
(function () {
  const links = Array.from(document.querySelectorAll('a[data-lightbox]'));
  if (!links.length) {
    return;
  }

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const DURATION = calm ? 0 : 330;
  const EASING = 'cubic-bezier(.5, 0, .14, 1)';
  const IDLE_AFTER = 3000;
  const SWIPE = 50;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Bildansicht');
  dialog.innerHTML =
    '<div class="lightbox-bg"></div>' +
    '<div class="lightbox-stage"><img class="lightbox-img" alt=""></div>' +
    '<div class="lightbox-spinner"></div>' +
    '<div class="lightbox-bar">' +
      '<span class="lightbox-counter" aria-live="polite"></span>' +
      '<div class="lightbox-tools">' +
        '<button type="button" class="lightbox-zoom" aria-label="Zoomen">' + ICONS.zoom + '</button>' +
        '<button type="button" class="lightbox-close" aria-label="Schließen">' + ICONS.close + '</button>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="lightbox-prev" aria-label="Vorheriges Bild">' + ICONS.arrow + '</button>' +
    '<button type="button" class="lightbox-next" aria-label="Nächstes Bild">' + ICONS.arrow + '</button>' +
    '<p class="lightbox-caption" hidden></p>';
  document.body.appendChild(dialog);

  const find = selector => dialog.querySelector(selector);
  const bg = find('.lightbox-bg');
  const stage = find('.lightbox-stage');
  const img = find('.lightbox-img');
  const counter = find('.lightbox-counter');
  const caption = find('.lightbox-caption');
  const zoomButton = find('.lightbox-zoom');
  const prevButton = find('.lightbox-prev');
  const nextButton = find('.lightbox-next');

  let group = [];
  let index = 0;
  let loading = 0; // id of the latest load, older ones are dropped
  let closing = false;
  let idleTimer;

  links.forEach(link => link.addEventListener('click', e => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return; // new tab/window keeps working
    }
    e.preventDefault();
    const name = link.dataset.lightbox;
    group = name ? links.filter(other => other.dataset.lightbox === name) : [link];
    open(group.indexOf(link));
  }));

  function open(i) {
    // nothing focused, so closing doesn't restore (and scroll to) the link
    if (document.activeElement) {
      document.activeElement.blur();
    }
    document.body.classList.add('lightbox-open');
    dialog.showModal();
    dialog.classList.add('is-open');
    wake();
    fade(bg, 0, 1);
    show(i).then(ok => ok && animateFromThumb());
  }

  function close() {
    if (!dialog.open || closing) {
      return;
    }
    closing = true;
    zoomOut(false);
    dialog.classList.remove('is-open');
    const from = img.getBoundingClientRect();
    const thumb = visibleThumb(group[index]);
    const animation = thumb && img.complete && from.width
      ? img.animate([{transform: 'none'}, {transform: flip(thumb, from)}], {duration: DURATION, easing: EASING, fill: 'forwards'})
      : fade(img, 1, 0);
    fade(bg, 1, 0);
    animation.finished.then(() => dialog.close());
  }

  // cleanup also runs when the browser closes the dialog by itself
  dialog.addEventListener('close', () => {
    img.getAnimations().concat(bg.getAnimations()).forEach(a => a.cancel());
    img.removeAttribute('src');
    dialog.classList.remove('is-open', 'is-zoomed', 'is-idle');
    document.body.classList.remove('lightbox-open');
    group[index].focus({preventScroll: true});
    closing = false;
  });

  // Esc: close with the animation
  dialog.addEventListener('cancel', e => {
    e.preventDefault();
    close();
  });

  // loads image i; resolves true once it is decoded (false if a newer load won)
  function show(i) {
    const link = group[i];
    const thumb = link.querySelector('img');
    const id = ++loading;
    index = i;

    dialog.classList.add('is-loading');
    img.style.opacity = '0';
    img.src = link.href;
    img.alt = thumb ? thumb.alt : '';
    caption.textContent = link.dataset.caption || '';
    caption.hidden = !link.dataset.caption;
    counter.textContent = group.length > 1 ? (i + 1) + ' / ' + group.length : '';
    prevButton.hidden = i === 0;
    nextButton.hidden = i === group.length - 1;

    // preload the neighbours
    [i - 1, i + 1].filter(n => group[n]).forEach(n => {
      new Image().src = group[n].href;
    });

    return img.decode().catch(() => null).then(() => {
      if (id !== loading) {
        return false;
      }
      dialog.classList.remove('is-loading');
      img.style.opacity = '';
      updateZoomable();
      return true;
    });
  }

  function go(step) {
    const i = index + step;
    if (!group[i] || closing) {
      return;
    }
    zoomOut(false);
    fade(img, 1, 0, DURATION / 2).finished.then(() => show(i)).then(ok => {
      img.getAnimations().forEach(a => a.cancel());
      if (ok) {
        fade(img, 0, 1);
      }
    });
  }

  function animateFromThumb() {
    const to = img.getBoundingClientRect();
    const thumb = visibleThumb(group[index]);
    if (thumb && to.width) {
      img.animate([{transform: flip(thumb, to)}, {transform: 'none'}], {duration: DURATION, easing: EASING});
    } else {
      fade(img, 0, 1);
    }
  }

  // transform that puts the element at rect `to` onto rect `from`
  function flip(from, to) {
    return 'translate(' + (from.left - to.left) + 'px, ' + (from.top - to.top) + 'px) ' +
      'scale(' + (from.width / to.width) + ', ' + (from.height / to.height) + ')';
  }

  function fade(el, from, to, duration) {
    return el.animate([{opacity: from}, {opacity: to}], {duration: duration === undefined ? DURATION : duration, fill: 'forwards'});
  }

  // the thumbnail's rect, if it is actually visible (not scrolled away in the
  // page or a slider)
  function visibleThumb(link) {
    const thumb = link.querySelector('img') || link;
    const rect = thumb.getBoundingClientRect();
    const clip = thumb.closest('.slider');
    const box = clip ? clip.getBoundingClientRect() : {left: 0, right: window.innerWidth};
    const visible = rect.width && rect.bottom > 0 && rect.top < window.innerHeight &&
      rect.left >= box.left - 1 && rect.right <= box.right + 1;
    return visible ? rect : null;
  }

  // zoom: natural size inside the scrolling stage, centred on the clicked point

  function updateZoomable() {
    const zoomable = !dialog.classList.contains('is-zoomed') &&
      (img.naturalWidth > img.clientWidth + 1 || img.naturalHeight > img.clientHeight + 1);
    dialog.classList.toggle('is-zoomable', zoomable);
    zoomButton.hidden = !zoomable && !dialog.classList.contains('is-zoomed');
  }

  function zoomIn(x, y) {
    const before = img.getBoundingClientRect();
    const fx = x === undefined ? .5 : (x - before.left) / before.width;
    const fy = y === undefined ? .5 : (y - before.top) / before.height;
    dialog.classList.add('is-zoomed');
    stage.scrollLeft = fx * img.offsetWidth - stage.clientWidth / 2;
    stage.scrollTop = fy * img.offsetHeight - stage.clientHeight / 2;
    img.animate([{transform: flip(before, img.getBoundingClientRect())}, {transform: 'none'}], {duration: DURATION, easing: EASING});
    updateZoomable();
  }

  function zoomOut(animated) {
    if (!dialog.classList.contains('is-zoomed')) {
      return;
    }
    const before = img.getBoundingClientRect();
    dialog.classList.remove('is-zoomed');
    if (animated) {
      img.animate([{transform: flip(before, img.getBoundingClientRect())}, {transform: 'none'}], {duration: DURATION, easing: EASING});
    }
    updateZoomable();
  }

  zoomButton.addEventListener('click', () => {
    if (dialog.classList.contains('is-zoomed')) {
      zoomOut(true);
    } else {
      zoomIn();
    }
  });
  find('.lightbox-close').addEventListener('click', close);
  prevButton.addEventListener('click', () => go(-1));
  nextButton.addEventListener('click', () => go(1));

  let swiped = false;
  stage.addEventListener('click', e => {
    if (swiped) {
      swiped = false;
    } else if (e.target !== img) {
      close(); // click beside the image
    } else if (dialog.classList.contains('is-zoomed')) {
      zoomOut(true);
    } else if (dialog.classList.contains('is-zoomable')) {
      zoomIn(e.clientX, e.clientY);
    } else if (touch) {
      dialog.classList.toggle('is-idle');
    }
  });

  dialog.addEventListener('keydown', e => {
    wake();
    if (e.key === 'ArrowLeft') {
      go(-1);
    } else if (e.key === 'ArrowRight') {
      go(1);
    }
  });

  window.addEventListener('resize', () => dialog.open && updateZoomable());

  // swipe (touch only): sideways for the next/previous image, up or down to close

  let start = null;

  stage.addEventListener('pointerdown', e => {
    swiped = false;
    if (e.pointerType === 'mouse' || dialog.classList.contains('is-zoomed') || !e.isPrimary) {
      return;
    }
    start = {x: e.clientX, y: e.clientY};
  });

  stage.addEventListener('pointermove', e => {
    if (!start || !e.isPrimary) {
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      img.style.transform = 'translateX(' + dx + 'px)';
      bg.style.opacity = '';
    } else {
      img.style.transform = 'translateY(' + dy + 'px)';
      bg.style.opacity = String(1 - Math.min(Math.abs(dy) / 400, .6));
    }
  });

  function endSwipe(e) {
    if (!start) {
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    swiped = Math.abs(dx) > 10 || Math.abs(dy) > 10;
    img.style.transform = '';
    bg.style.opacity = '';
    if (e.type === 'pointercancel') {
      return;
    }
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE) {
      go(dx < 0 ? 1 : -1);
    } else if (Math.abs(dy) > SWIPE * 1.6) {
      close();
    }
  }

  stage.addEventListener('pointerup', endSwipe);
  stage.addEventListener('pointercancel', endSwipe);

  // controls fade out after a few idle seconds (mouse), a tap brings them back (touch)

  function wake() {
    dialog.classList.remove('is-idle');
    clearTimeout(idleTimer);
    if (!touch) {
      idleTimer = setTimeout(() => dialog.classList.add('is-idle'), IDLE_AFTER);
    }
  }

  dialog.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') {
      wake();
    }
  });
})();


(function () {
  const torch = document.getElementById('torch');
  const root = document.documentElement;
  const button = document.querySelector('[data-btn-toggle-dark-mode]');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;

  // on touch the beam sits above the finger, so the thumb doesn't hide the light
  const TOUCH_OFFSET = 80;
  // phones: 30 fps is plenty and saves (real) battery
  const MIN_FRAME_MS = touchDevice ? 1000 / 30 : 0;

  // where the pointer is vs. where the (slightly lagging, shaky) beam is
  const target = {x: window.innerWidth / 2, y: window.innerHeight / 2};
  const beam = {x: target.x, y: target.y};

  let intensity = .85;
  let flicker = 0; // remaining (60 fps) frames of the current flicker
  let frame = null;
  let last = 0;
  let t = 0;

  function render() {
    torch.style.setProperty('--x', beam.x.toFixed(1) + 'px');
    torch.style.setProperty('--y', beam.y.toFixed(1) + 'px');
    torch.style.setProperty('--i', intensity.toFixed(3));
  }

  function tick(now) {
    frame = window.requestAnimationFrame(tick);
    // a few ms of slack, otherwise a 60 Hz display skips to every third frame
    if (now - last < MIN_FRAME_MS - 4) {
      return;
    }
    // everything below is tuned for 60 fps; dt scales it to the real frame time
    const dt = last ? Math.min((now - last) / (1000 / 60), 4) : 1;
    last = now;
    t += dt;

    // hand: follow with a bit of inertia plus a slow tremor
    const follow = 1 - Math.pow(.8, dt);
    beam.x += (target.x - beam.x) * follow + (Math.sin(t * .09) * .35 + Math.sin(t * .23) * .2) * dt;
    beam.y += (target.y - beam.y) * follow + (Math.cos(t * .07) * .35 + Math.sin(t * .31) * .2) * dt;

    // weak battery: slow wobble, now and then a short flicker
    let next = .82 + Math.sin(t * .013) * .05 + (Math.random() - .5) * .03;
    if (flicker > 0) {
      flicker -= dt;
      next *= .35 + Math.random() * .45;
    } else if (Math.random() < .004 * dt) {
      flicker = 3 + Math.floor(Math.random() * 10);
    }
    intensity += (next - intensity) * (1 - Math.pow(.5, dt));

    render();
  }

  function start() {
    if (calm) {
      render();
    } else if (!frame) {
      last = 0;
      frame = window.requestAnimationFrame(tick);
    }
  }

  function stop() {
    window.cancelAnimationFrame(frame);
    frame = null;
  }

  function aimAt(x, y) {
    target.x = x;
    target.y = Math.max(0, y);
    sessionStorage.setItem('torch-x', String(target.x));
    sessionStorage.setItem('torch-y', String(target.y));
    if (calm) {
      beam.x = target.x;
      beam.y = target.y;
      render();
    }
  }

  // mouse and pen
  ['pointermove', 'pointerdown'].forEach(type => {
    window.addEventListener(type, e => {
      if (e.pointerType !== 'touch') {
        aimAt(e.clientX, e.clientY);
      }
    });
  });

  // touch: unlike pointer events, touchmove keeps firing while the page scrolls,
  // and a plain tap moves the beam as well
  function onTouch(e) {
    const touch = e.touches[0];
    if (touch && !button.contains(e.target)) {
      aimAt(touch.clientX, touch.clientY - TOUCH_OFFSET);
    }
  }
  window.addEventListener('touchstart', onTouch, {passive: true});
  window.addEventListener('touchmove', onTouch, {passive: true});

  button.addEventListener('click', () => {
    root.classList.add('torch-fade');
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      sessionStorage.setItem('dark', 'false');
      stop();
    } else {
      root.classList.add('dark');
      sessionStorage.setItem('dark', 'true');
      start();
    }
  });

  // init:
  if (sessionStorage.getItem('dark') === 'true') {
    target.x = beam.x = sessionStorage.getItem('torch-x') * 1 || target.x;
    target.y = beam.y = sessionStorage.getItem('torch-y') * 1 || target.y;
    root.classList.add('dark');
    start();
  }
  render();

})();


// easter egg "Der Mond über Wanne-Eickel": konami code, or 5 quick taps/clicks
// on the footer logo (no keyboard on phones)
(function () {
  const KONAMI = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a';
  const DURATION = 11000;
  let keys = [];

  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) {
      return;
    }
    keys = keys.concat(e.key.length === 1 ? e.key.toLowerCase() : e.key).slice(-10);
    if (keys.join(' ') === KONAMI) {
      keys = [];
      moonrise();
    }
  });

  const footerLogo = document.querySelector('#site-footer .logo');
  let taps = 0;
  let tapTimer;
  if (footerLogo) {
    footerLogo.addEventListener('click', () => {
      taps += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => taps = 0, 600);
      if (taps >= 5) {
        taps = 0;
        moonrise();
      }
    });
  }

  function moonrise() {
    if (document.querySelector('.moonrise')) {
      return;
    }

    const scene = document.createElement('div');
    scene.className = 'moonrise';
    scene.innerHTML =
      '<div class="moonrise-stars" aria-hidden="true"></div>' +
      '<div class="moonrise-moon" aria-hidden="true"></div>' +
      '<div class="moonrise-flyer" aria-hidden="true">' +
        '<svg viewBox="0 0 240 90" fill="#050403" xmlns="http://www.w3.org/2000/svg">' +
          // fork: handle, neck, three tines
          '<rect x="0" y="41" width="104" height="10" rx="5"/>' +
          '<path d="M98 41h14l8-8h5v26h-5l-8-8h-14z"/>' +
          '<rect x="123" y="34" width="26" height="4" rx="2"/>' +
          '<rect x="123" y="44" width="26" height="4" rx="2"/>' +
          '<rect x="123" y="54" width="26" height="4" rx="2"/>' +
          // bratwurst (slightly bent, with dark grey grill marks) and its twisted ends
          '<path d="M142 36Q188 22 228 31Q241 35 239 46Q237 58 224 59Q186 64 144 59Q132 57 132 47Q132 39 142 36Z"/>' +
          '<path d="M160 56l12-24M180 56l12-25M200 56l12-24M220 55l9-18" fill="none" stroke="#3a3a3a" stroke-width="2.5" stroke-linecap="round"/>' +
          '<path d="M130 47l-7-5v10z"/>' +
          '<path d="M240 45l6-5v10z"/>' +
        '</svg>' +
      '</div>' +
      '<p class="moonrise-claim" role="status"><img src="/assets/images/logo.svg" alt="GourMonds –">' +
        'der beste BBQ-Verein unter\'m <em>Wanne-Eickeler</em> Mond!</p>' +
      '<p class="moonrise-hint">Klicken oder Esc zum Schließen</p>';
    document.body.appendChild(scene);

    // next frame, so the fade-in transition runs
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => scene.classList.add('is-on')));

    const timer = setTimeout(close, DURATION);

    function onKey(e) {
      if (e.key === 'Escape') {
        close();
      }
    }

    function close() {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      scene.classList.add('is-off');
      setTimeout(() => scene.remove(), 800);
    }

    scene.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
  }

})();


// 404: rescue the sausage from the coals with the tongs.
// Still lying in the coals after five seconds, it chars; rescued in time, the
// five-second rule applies and it stays fine on the grate.
(function () {
  const scene = document.querySelector('[data-component="rescue-sausage"]');
  if (!scene) {
    return;
  }
  const button = scene.querySelector('[data-rescue]');
  const message = document.querySelector('[data-rescue-message]');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CHAR_AFTER = 5000;
  const fellAt = Date.now();

  const charTimer = window.setTimeout(() => scene.classList.add('is-charred'), CHAR_AFTER);

  button.addEventListener('click', () => {
    window.clearTimeout(charTimer);
    const seconds = (Date.now() - fellAt) / 1000;
    const formatted = seconds.toLocaleString('de-DE', {maximumFractionDigits: 1});
    const inTime = !scene.classList.contains('is-charred');
    const text = inTime
      ? 'Puh, die Wurst ist wieder auf dem Rost &ndash; die Seite leider nicht. '
      : 'Zu spät, die Wurst ist verkohlt &ndash; genau wie diese Seite. ';
    const verdict = inTime
      ? 'Gerettet nach ' + formatted + ' Sekunden. Fünf-Sekunden-Regel: gilt! Guten Appetit.'
      : formatted + ' Sekunden in der Glut. Da gilt die Fünf-Sekunden-Regel nicht mehr.';

    button.disabled = true;
    scene.classList.add('is-grabbing');
    window.setTimeout(() => scene.classList.add('is-lifted'), calm ? 0 : 650);
    window.setTimeout(() => {
      scene.classList.remove('is-grabbing', 'is-lifted');
      scene.classList.add('is-rescued');
      message.innerHTML = text + '<span class="nf-verdict" role="status"></span>';
      message.querySelector('.nf-verdict').textContent = verdict;
    }, calm ? 0 : 1400);
  });
})();
