(function ($) {

  'use strict';

  let timeout;

  $(function () {

    $('[data-slick]').slick();

    $('#toggle-nav').on('click', function () {
      $('nav.main').toggleClass('open');
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

  function moveTorch(x, y) {
    torch.style.setProperty('--x', x + 'px');
    torch.style.setProperty('--y', y + 'px');
    sessionStorage.setItem('torch-x', String(x));
    sessionStorage.setItem('torch-y', String(y));
  }

  window.addEventListener('pointermove', e => {
    moveTorch(e.clientX, e.clientY);
  });

  document.querySelector('[data-btn-toggle-dark-mode]').addEventListener('click', () => {
    const classList = document.documentElement.classList;
    if (classList.contains('dark')) {
      classList.remove('dark');
      sessionStorage.setItem('dark', 'false');
    } else {
      classList.add('dark');
      sessionStorage.setItem('dark', 'true');
    }
  });

  // init:
  if (sessionStorage.getItem('dark') === 'true') {
    document.documentElement.classList.add('dark');
    moveTorch(sessionStorage.getItem('torch-x') * 1, sessionStorage.getItem('torch-y') * 1);
  } else {
    moveTorch(window.innerWidth / 2, window.innerHeight / 2);
  }

})();
