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
