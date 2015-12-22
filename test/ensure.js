function runTest(execlib, service) {
  try {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;
  qlib.promise2console(service.ensure('sales', 100000, ['bla']).then(
    service.dumpToConsole.bind(service)
  ), 'ensure'); //by default, referenceUserNames are ['String']
  } catch(e) {
    console.error(e.stack);
    console.error(e);
  }
}

module.exports = require('./init').bind(null, runTest);
