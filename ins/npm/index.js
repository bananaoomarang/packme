var Wreck     = require('wreck');
var Bluebird  = require('bluebird');
var Path      = require('path');
var objectMap = require('../../lib/objectMap');

var wreckNpm = Wreck.defaults({
    baseUrl: 'http://registry.npmjs.org/',
    json: true
})

Bluebird.promisifyAll(wreckNpm);

var transform = {
    name:         'pkgname',
    version:      'pkgver',
    description:  'pkgdesc',
    cpu:          'arch',

    dist:         {
        tarball: ['source'],
        shasum:  ['sha1sums']
    },

    dependencies: function (deps) {
        return { key: 'depends', val: Object.keys(deps) };
    },

    devDependencies: function (deps) {
        return { key: 'makeDepends', val: Object.keys(deps) };
    }
};

function defaultVal(x, val) {
    if(!x)
        x = val;
}

module.exports = function (pkgname) {
    return wreckNpm
        .getAsync(Path.join(pkgname, 'latest'))
            .spread(function (res, body) {
                var transformed = objectMap(body, transform);

                defaultVal(transformed.arch, 'any');

                return transformed;
            });
}
