const path = require('path')
const sass = require('sass')
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
        const {css} = sass.renderSync({ file })
        const output = new CleanCSS({}).minify(css.toString()).styles

        return output;
    }
}
