module.exports = {
    normalize_whitespace: s => s.replace(/\s+/g, ' '),
    collectionFilters: {
        extensionHTML: item => item.inputPath.split('.').pop() === 'html',
        notExcludedFromSitemap: item => item.data.sitemap !== false
    }
}
