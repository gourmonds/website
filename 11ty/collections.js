const { collectionMappers } = require('./mappers');
const { collectionSorters } = require('./sorters');
const { collectionFilters } = require('./filters');

module.exports = {
    sitemapCollection: (collectionApi) =>
        collectionApi.getAll()
            .filter(collectionFilters.extensionHTML)
            .filter(collectionFilters.notExcludedFromSitemap)
            .sort(collectionSorters.byDateDESC)
            .map(collectionMappers.addLastModISOString),
    blogTagCollection: (collectionApi) =>
        collectionApi.getFilteredByTag('blog')
            .sort(collectionSorters.byDateDESC),
    recipeTagCollection: (collectionApi) =>
        collectionApi.getFilteredByTag('recipe')
            .sort(collectionSorters.byNameASC),
    testTagCollection: (collectionApi) =>
        collectionApi.getFilteredByTag('test')
            .sort(collectionSorters.byNameASC),
    howtoTagCollection: (collectionApi) =>
        collectionApi.getFilteredByTag('howto')
            .sort(collectionSorters.byNameASC)
}
