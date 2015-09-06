'use strict';

var Bluebird      = require('bluebird');
var Fs            = require('fs');
var Path          = require('path');
var MkdirpAsync   = Bluebird.promisify(require('mkdirp'));
var RimRafAsync   = Bluebird.promisify(require('rimraf'));
var ExecFileAsync = Bluebird.promisify(require('child_process').execFile);

Bluebird.promisifyAll(Fs);

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
}


function out (cfg) {

    function makePackage(path) {
        var args = [
            '--nodeps',
            '--cleanbuild'
        ];

        var opts = {
            cwd: path
        }

        var packageFile   = [cfg.pkgname, cfg.pkgver, cfg.pkgrel, cfg.arch].join('-') + '.pkg.tar.xz';
        var pathToPackage = Path.join(process.cwd(), path, packageFile);

        return ExecFileAsync('makepkg', args, opts)
            .then(function () {
                return Fs.readFileAsync(pathToPackage);
            })
            .catch(function (e) {
                // XXX
                throw e;
            });
    }

    var PKGBUILD = '';
    var keys = Object.keys(cfg);

    keys
      .filter(function (key) {
          return (isString(cfg[key]) && !isFunc(key));
      })
      .forEach(function (key) {
          PKGBUILD += [key, '"' + cfg[key] + '"'].join('=');
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

    var TMP_DIR = cfg.pkgname + '-tmp';

    return RimRafAsync(TMP_DIR)
        .then(function () {
            return MkdirpAsync(TMP_DIR)
        })
        .then(function () {
            return Fs.writeFileAsync(TMP_DIR + '/' + 'PKGBUILD', PKGBUILD);
        })
        .then(function () {
            return makePackage(TMP_DIR)
        })
        .tap(function () {
            return RimRafAsync(TMP_DIR);
        })
        .then(function (result) {
            return {
                [cfg.pkgname + '.pkg.tar.xz']: result
            }
        })
        .catch(function (e) {
            throw e;
        });
}

module.exports = {
  i: _in,
  o: out
};
