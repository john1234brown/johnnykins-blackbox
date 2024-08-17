const { pObby } = require('johnnykins-blackbox');

const test = new pObby('./server.js', 30000, 60000, false);