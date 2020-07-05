const fs = require('fs');

module.exports = {
    collectionMappers: {
        addLastModISOString: (item) => {
            item.lastmod =  fs.statSync(item.inputPath).mtime.toISOString();
            return item;
        }
    }
}
