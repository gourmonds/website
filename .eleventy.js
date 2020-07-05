const {recipeTagCollection, testTagCollection, howtoTagCollection, blogTagCollection, sitemapCollection} = require('./11ty/collections');
const {normalize_whitespace} = require('./11ty/filters');
const {configuration} = require('./11ty/configuration');
const {htmlMinifier} = require('./11ty/transformers');
const env = process.env.ELEVENTY_ENV || 'dev';

module.exports = function (eleventyConfig) {

    // set configurations
    eleventyConfig.setDataDeepMerge(configuration.dataDeepMerge);
    eleventyConfig.setLiquidOptions(configuration.liquid);
    eleventyConfig.setBrowserSyncConfig(configuration.browserSync);

    // add custom collections
    eleventyConfig.addCollection('recipe', recipeTagCollection);
    eleventyConfig.addCollection('test', testTagCollection);
    eleventyConfig.addCollection('howto', howtoTagCollection);
    eleventyConfig.addCollection('blog', blogTagCollection);
    eleventyConfig.addCollection('sitemap', sitemapCollection);

    // add filters
    eleventyConfig.addLiquidFilter('normalize_whitespace', normalize_whitespace);

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
        dataTemplateEngine: 'liquid',
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'liquid',
        templateFormats: ['html', 'js', 'liquid', 'njk']
    }
};
