const path = require('path');

module.exports = {
    configuration: {
        staticFiles: (() => {
            const staticFiles = {};
            staticFiles['src/assets'] = 'assets';
            staticFiles['src/.htaccess'] = '.htaccess';
            staticFiles[path.join('node_modules', 'slick-slider', 'slick', 'fonts')] = path.join('assets', 'slick');
            staticFiles[path.join('node_modules', 'slick-slider', 'slick', 'ajax-loader.gif')] = path.join('assets', 'slick', 'ajax-loader.gif');
            staticFiles[path.join('node_modules', '@fontsource', 'fira-sans-extra-condensed', 'files', 'fira-sans-extra-condensed-latin-400-normal.woff2')] = path.join('assets', 'fonts', 'fira-sans-extra-condensed-400.woff2');
            staticFiles[path.join('node_modules', '@fontsource', 'fira-sans-extra-condensed', 'files', 'fira-sans-extra-condensed-latin-500-normal.woff2')] = path.join('assets', 'fonts', 'fira-sans-extra-condensed-500.woff2');
            staticFiles[path.join('node_modules', '@fontsource', 'fira-sans-extra-condensed', 'files', 'fira-sans-extra-condensed-latin-600-normal.woff2')] = path.join('assets', 'fonts', 'fira-sans-extra-condensed-600.woff2');
            staticFiles[path.join('node_modules', '@fontsource', 'fira-sans-extra-condensed', 'files', 'fira-sans-extra-condensed-latin-700-normal.woff2')] = path.join('assets', 'fonts', 'fira-sans-extra-condensed-700.woff2');
            staticFiles[path.join('node_modules', '@fontsource', 'libertinus-sans', 'files', 'libertinus-sans-latin-400-normal.woff2')] = path.join('assets', 'fonts', 'libertinus-sans.woff2');
            staticFiles[path.join('node_modules', '@fontsource', 'libertinus-sans', 'files', 'libertinus-sans-latin-400-italic.woff2')] = path.join('assets', 'fonts', 'libertinus-sans-italic.woff2');
            staticFiles[path.join('node_modules', '@fontsource', 'libertinus-sans', 'files', 'libertinus-sans-latin-700-normal.woff2')] = path.join('assets', 'fonts', 'libertinus-sans-bold.woff2');
            return staticFiles;
        })(),
        liquid: {
            dynamicPartials: true
        },
        // Eleventy Dev Server answers unknown urls with build/404.html by itself
        server: {
            port: 8081
        },
        htmlMinifier: {
            useShortDoctype: true,
            removeComments: true,
            collapseWhitespace: true,
            minifyJS: true,
            html5: true,
            removeOptionalTags: true,
            removeRedundantAttributes: true,
            removeTagWhitespace: false
        }
    }
}
