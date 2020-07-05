const path = require('path');
const {error404Page} = require('./middlewares');

module.exports = {
    configuration: {
        middlewares: {
            error404Page: path.join('build', '404.html')
        },
        staticFiles: (() => {
            const staticFiles = {};
            staticFiles['src/assets'] = 'assets';
            staticFiles[path.join('node_modules', 'slick-slider', 'slick', 'fonts')] = path.join('assets', 'slick');
            staticFiles[path.join('node_modules', 'slick-slider', 'slick', 'ajax-loader.gif')] = path.join('assets', 'slick', 'ajax-loader.gif');
            return staticFiles;
        })(),
        liquid: {
            dynamicPartials: true
        },
        dataDeepMerge: true,
        browserSync: {
            callbacks: {
                ready: (err, bs) => {
                    bs.addMiddleware("*", error404Page);
                }
            }
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
