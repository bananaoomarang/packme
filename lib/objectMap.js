module.exports = function objectMap(obj, tr) {
    var returns = Object.create(null);

    Object
      .keys(obj)
      .forEach(function (key) {
          if(tr[key] instanceof Array)
              return tr[key]
                  .forEach(function (subkey) {
                      if(!returns[subkey])
                          returns[subkey] = [];

                      returns[subkey].push(obj[key]);
                  });

          if(typeof tr[key] === 'object') {
              var subMap = objectMap(obj[key], tr[key]);

              return Object
                  .keys(subMap)
                  .forEach(function (subkey) {
                      returns[subkey] = subMap[subkey];
                  });
          }

          if(typeof tr[key] === 'function')
              return returns[key] = tr[key](obj[key])

          if(tr[key])
              returns[tr[key]] = obj[key];
      });

      return returns;
};
