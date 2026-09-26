const {recipeTagCollection, testTagCollection, howtoTagCollection, blogTagCollection, sitemapCollection} = require('./11ty/collections');
const {normalize_whitespace} = require('./11ty/filters');
const {configuration} = require('./11ty/configuration');
const {htmlMinifier} = require('./11ty/transformers');
const {eleventyImageTransformPlugin} = require('@11ty/eleventy-img');
const env = process.env.ELEVENTY_ENV || 'dev';

module.exports = function (eleventyConfig) {

    // set configurations
    eleventyConfig.setLiquidOptions(configuration.liquid);
    eleventyConfig.setServerOptions(configuration.server);

    // css and js are rendered by .11ty.js templates reading these folders,
    // so a change there has to trigger a rebuild
    eleventyConfig.addWatchTarget('./src/css/_scss/');
    eleventyConfig.addWatchTarget('./src/js/_js/');

    // add custom collections
    eleventyConfig.addCollection('recipe', recipeTagCollection);
    eleventyConfig.addCollection('test', testTagCollection);
    eleventyConfig.addCollection('howto', howtoTagCollection);
    eleventyConfig.addCollection('blog', blogTagCollection);
    eleventyConfig.addCollection('sitemap', sitemapCollection);

    // add filters
    eleventyConfig.addLiquidFilter('normalize_whitespace', normalize_whitespace);

    // responsive images: every <img> in the output becomes a <picture> with
    // AVIF plus the original format, several widths (never upscaled), width/height
    // and lazy loading; opt out per image with eleventy:ignore, override the
    // lazy loading with loading="eager" (and a sizes attribute) above the fold
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, configuration.images);

    // add output transformers
    if ('prod' === env) {
        eleventyConfig.addTransform('htmlmin', htmlMinifier);
    }
    // copy static files
    eleventyConfig.addPassthroughCopy(configuration.staticFiles);

    return {
        dir: {
            input: './src',
            output: './build',
            includes: '_includes',
            layouts: '_layouts',
            data: '_data'
        },
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'liquid',
        templateFormats: ['html', '11ty.js', 'liquid', 'njk']
    }
};
