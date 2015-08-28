var Wreck     = require('wreck');
var Bluebird  = require('bluebird');
var Path      = require('path');
var objectMap = require('../../lib/objectMap');

var installScript =`
local _npmdir="$pkdir/usr/lib/node_modules"
mkdir -p $_npmdir
cd $_npmdir
npm i -g --prefix "$pkgdir/usr" $pkgname@$pkgver
`;

var wreckNpm = Wreck.defaults({
    baseUrl: 'http://registry.npmjs.org/',
    json: true
});

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

function defaultVal(obj, key, val) {
    if(!obj[key])
        obj[key] = val;
}

module.exports = function npmin(pkgname, pkgCache) {
    if(!pkgCache)
        pkgCache = {};

    return wreckNpm
        .getAsync(Path.join(pkgname, 'latest'))
            .spread(function (res, body) {
                var pkgJSON = objectMap(body, transform);

                defaultVal(pkgJSON, 'arch', ['any']);
                defaultVal(pkgJSON, 'pkgrel', '1');

                var depends = [];
                var makeDepends = [];

                if(pkgJSON.depends)
                   depends = pkgJSON.depends.map(function (dep) {
                        if(pkgCache[dep])
                            return Bluebird.resolve(dep);

                        return npmin(dep, pkgCache)
                            .then(function (result) {
                                return result;
                            });
                    });

                if(pkgJSON.makeDepends)
                    makeDepends = pkgJSON.makeDepends.map(function (dep) {
                        if(pkgCache[dep])
                            return Bluebird.resolve(dep);

                        return npmin(dep, pkgCache)
                            .then(function (result) {
                                return result;
                            });
                    });



                return Bluebird.all(
                    depends.concat(makeDepends)
                )
                .tap(function (pkgJSON2) {
                    pkgCache[pkgJSON2.pkgname] = true;

                    pkgJSON.package = installScript;
                })
                .return(pkgJSON);
            });
}
