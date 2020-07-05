const path = require('path')
const sass = require('node-sass-promise')
const CleanCSS = require('clean-css')

module.exports = class {
    data() {
        return {
            permalink: '/css/print.css',
            eleventyExcludeFromCollections: true
        }
    }

    async render() {
        const file = path.join(__dirname, '_scss', 'print.scss');
        const {css} = await sass.render({ file })
        const output = new CleanCSS({}).minify(css.toString()).styles

        return output;
    }
}
