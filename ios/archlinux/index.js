var Bluebird      = require('bluebird');
var ExecFileAsync = Bluebird.promisify(require('child_process').execFile);

function isString(x) {
    return typeof x === 'string';
}

function isObject(x) {
    return (typeof x === 'object' &&
            !(x instanceof Array));
}

function isFunc(key) {
    return [
        'prepare',
        'build',
        'check',
        'package'
    ]
    .filter(function (functionKey) {
        return key === functionKey;
    }).length;
}

function _in (cfg) {
  // XXX 
  return null;
};

function out (cfg) {
    var PKGBUILD = '';
    var keys = Object.keys(cfg);

    keys
      .filter(function (key) {
          return (isString(cfg[key]) && !isFunc(key));
      })
      .forEach(function (key) {
          PKGBUILD += [key, '\'' + cfg[key] + '\''].join('=');
          PKGBUILD += '\n';
      });

    keys
      .filter(function (key) {
          return isObject(cfg[key]);
      })
      .forEach(function (key) {
          var pkgbuildList = '(';
          var subkeys = Object.keys(cfg[key]);

          subkeys
              .forEach(function (subkey, index) {
                  pkgbuildList += '\'' + subkey + '\'' + (subkeys.length === index + 1 ? '' : ', ');
              });

          pkgbuildList += ')';

          PKGBUILD += [key, pkgbuildList].join('=');
          PKGBUILD += '\n';
      });

    keys
      .filter(function (key) {
          return Array.isArray(cfg[key]);
      })
      .forEach(function (key) {
          var pkgbuildList = '(';
          cfg[key]
              .forEach(function (subkey, index) {
                  pkgbuildList += '\'' + subkey + '\'' + (cfg[key].length === index + 1 ? '' : ', ');
              });

          pkgbuildList += ')';

          PKGBUILD += [key, pkgbuildList].join('=');
          PKGBUILD += '\n';
      });

    keys
        .filter(isFunc)
        .forEach(function (key) {
            var func = key + '()' + ' {\n'
                + cfg[key]
                + '}';

            PKGBUILD += func + '\n';
        });

    return {
        PKGBUILD: PKGBUILD
    };
};

module.exports = {
  i: _in,
  o: out
}
