const fs = require('fs');

module.exports = {
    error404Page: (req, res) => {
        const { configuration } = require('./configuration');
        const content_404 = fs.readFileSync(configuration.middlewares.error404Page);
        // Provides the 404 content without redirect.
        res.write(content_404);
        // Add 404 http status code in request header.
        // res.writeHead(404, { "Content-Type": "text/html" });
        res.writeHead(404);
        res.end();
    }
}
