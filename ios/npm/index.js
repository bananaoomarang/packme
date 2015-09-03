var Wreck       = require('wreck');
var Bluebird    = require('bluebird');
var Path        = require('path');
var objectMap   = require('../../lib/objectMap');

var installScript =`
local _npmdir="$pkdir/usr/lib/node_modules"
mkdir -p $_npmdir
cd $_npmdir
ls
npm i -g --prefix "$pkgdir/usr" $npmpkgname@$pkgver
`;

var wreckNpm = Wreck.defaults({
    baseUrl: 'http://registry.npmjs.org/',
    json: true
});

Bluebird.promisifyAll(wreckNpm);

var in_transform = {
    name:         'pkgname',
    name:         'npmpkgname',
    version:      'pkgver',
    description:  'pkgdesc',
    cpu:          'arch',

    dist:         {
        tarball: ['source'],
        shasum:  ['sha1sums']
    },

    dependencies: function (deps) {
        var val = {};

        Object
            .keys(deps)
            .forEach(function (key) {
                val[key] = deps[key];
            });

        return { key: 'depends', val: val };
    },

    devDependencies: function (deps) {
        return { key: 'makeDepends', val: Object.keys(deps) };
    }
};

function defaultVal(obj, key, val) {
    if(!obj[key])
        obj[key] = val;
}

function _in(pkgname) {
    return wreckNpm
        .getAsync(Path.join(pkgname, 'latest'))
            .spread(function (res, body) {
                var pkgJSON = objectMap(body, in_transform);

                defaultVal(pkgJSON, 'arch', ['any']);
                defaultVal(pkgJSON, 'pkgrel', '1');
                defaultVal(pkgJSON, 'depends', []);
                defaultVal(pkgJSON, 'makeDepends', []);

                pkgJSON.package = installScript;


                return pkgJSON;
            });
}

function out(cfg) {
  // XXX
  return null;
}

module.exports = {
  i: _in,
  o: out
};
