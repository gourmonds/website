module.exports = {
    collectionSorters: {
        byNameASC: (a, b) => a.data.title.localeCompare(b.data.title),
        byDateDESC: (a, b) => b.date - a.date
    }
}
