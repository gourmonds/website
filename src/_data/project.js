const env = process.env.ELEVENTY_ENV || 'dev';
const tracking = (process.env.ENABLE_TRACKING || false) === 'true';

module.exports = {
    env,
    tracking,
    title: (env === 'prod') ? 'GourMonds' : 'GourMonds (dev)',
    url: (env === 'prod') ? 'https://www.gourmonds.de' : 'http://localhost:8081'
};
