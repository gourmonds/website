const path = require('path');

module.exports = {
    configuration: {
        staticFiles: (() => {
            const staticFiles = {};
            staticFiles['src/assets'] = 'assets';
            staticFiles[path.join('node_modules', 'slick-slider', 'slick', 'fonts')] = path.join('assets', 'slick');
            staticFiles[path.join('node_modules', 'slick-slider', 'slick', 'ajax-loader.gif')] = path.join('assets', 'slick', 'ajax-loader.gif');
            staticFiles[path.join('node_modules', '@fontsource-variable', 'oswald', 'files', 'oswald-latin-wght-normal.woff2')] = path.join('assets', 'fonts', 'oswald.woff2');
            staticFiles[path.join('node_modules', '@fontsource-variable', 'inter', 'files', 'inter-latin-wght-normal.woff2')] = path.join('assets', 'fonts', 'inter.woff2');
            staticFiles[path.join('node_modules', '@fontsource-variable', 'inter', 'files', 'inter-latin-wght-italic.woff2')] = path.join('assets', 'fonts', 'inter-italic.woff2');
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
