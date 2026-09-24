(function ($) {

  'use strict';

  let timeout;

  $(function () {

    $('[data-slick]').slick();

    $('#toggle-nav').on('click', function () {
      const open = $('nav.main').toggleClass('open').hasClass('open');
      $('body').toggleClass('nav-open', open);
      $(this).attr('aria-expanded', open).attr('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    const $recipesIsotope = $('[data-component="recipes-isotope"]');
    const $formRecipeSearch = $('[data-component="form-recipe-search"]');
    const $noResultsMessage = $recipesIsotope.find('[data-component="no-results-message"]');

    let qsRegex = null;

    if ($recipesIsotope.length) {
      $recipesIsotope.imagesLoaded(function () {
        $recipesIsotope.isotope({
          itemSelector: '[data-component="recipe-teaser"]',
          layoutMode: 'fitRows',
          filter: function () {
            return (qsRegex !== null) ? $(this).getSearchableText().match(qsRegex) : true;
          }
        });
        checkResults();
      });
    }

    if ($formRecipeSearch.length) {
      qsRegex = new RegExp($formRecipeSearch.val(), 'gi');

      $formRecipeSearch.on('submit', function () {
        return false;
      });

      $formRecipeSearch.find('[data-component="search-term"]').on('keydown', function (e) {
        const $input = $(this);
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          qsRegex = ($input.val() !== '') ? new RegExp($input.val(), 'gi') : null;
          console.log('qsRegex:', qsRegex);
          $recipesIsotope.isotope();
          checkResults();
        }, 200);
      });
    }

    function checkResults() {
      const count = $recipesIsotope.data('isotope').filteredItems.length;
      if (count) {
        $noResultsMessage.addClass('d-none');
      } else {
        $noResultsMessage.removeClass('d-none');
      }
    }

  });

})(jQuery);

(function ($) {
  $.fn.getSearchableText = function () {
    const $element = $(this);
    return $element.data('tags') + ' ' +
        $element
            .text()
            .replace(/\u00ad/gi, '') // soft hyphen
            .replace(/\u00a0/gi, ' ') // non-breaking-space
            .replace(/\u0009/gi, ' ') // horizontal tab
            .replace(/\u000d/gi, ' ') // carriage return
            .replace(/\u000a/gi, ' ') // line feed
            .replace(/\u2026/gi, '...') // horizontal ellipsis
            .replace(/\s\s/gi, ' '); // double spaces
  }
})(jQuery);


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
