const fs = require('fs');
const {promisify} = require('util');
const path = require('path');

const {babelPromise, uglifyJSPromise} = require('../../11ty/transformers');

const env = process.env.ELEVENTY_ENV || 'dev';

module.exports = class {

    data() {
        return {
            permalink: '/js/custom.js',
            eleventyExcludeFromCollections: true
        }
    }

    render() {
        const file = path.join(__dirname, '_js', 'custom.js');
        const promise = promisify(fs.readFile)(file, {encoding: 'utf8'})
            .then(contents => babelPromise(contents, {forceAllTransforms: 'prod' === env}))
        return ('prod' === env) ? promise.then(contents => uglifyJSPromise(contents)) : promise;
    }
}
