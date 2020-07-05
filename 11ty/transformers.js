const htmlmin = require('html-minifier');
const {configuration} = require('./configuration');
const babel = require("@babel/core");
const UglifyJS = require("uglify-js");

module.exports = {
    htmlMinifier: (content, outputPath) => {
        if (outputPath.endsWith(".html")) {
            return htmlmin.minify(content, configuration.htmlMinifier);
        }
        return content;
    },
    babelPromise: (contents, options) => {
        return babel.transformAsync(contents, {
            "presets": [
                ["@babel/preset-env", options]
            ],
            "plugins": []
        }).then(result => result.code)
    },
    uglifyJSPromise: (contents) => {
        return new Promise((resolve, reject) => {
            const result = UglifyJS.minify(contents);
            result.error ? reject(result.error) : resolve(result.code);
        });
    }
}
