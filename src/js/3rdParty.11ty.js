const fs = require('fs');
const {promisify} = require('util');
const path = require('path');


module.exports = class {
    data() {
        return {
            permalink: '/js/3rdParty.js',
            eleventyExcludeFromCollections: true
        }
    }

    render() {
        const node_modules_path = path.normalize(path.join(__dirname, '../../', 'node_modules'));

        return Promise.all([
            path.join(node_modules_path, 'jquery', 'dist', 'jquery.min.js'),
            path.join(node_modules_path, 'imagesloaded', 'imagesloaded.pkgd.min.js'),
            path.join(node_modules_path, 'isotope-layout', 'dist', 'isotope.pkgd.min.js'),
            path.join(node_modules_path, '@fancyapps', 'fancybox', 'dist', 'jquery.fancybox.min.js'),
            path.join(node_modules_path, 'slick-slider', 'slick', 'slick.min.js'),
        ].map((file) => {
            return promisify(fs.readFile)(file, {encoding: 'utf8'});
        })).then(
            contents => contents.reduce((all, content) => all + ';' + content, '')
        );
    }
}
