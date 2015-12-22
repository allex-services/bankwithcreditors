function runTest(execlib, service) {
  try {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;
  qlib.promise2console(service.charge('5', -35200, ['bla']), 'charge'); //by default, referenceUserNames are ['String']
  } catch(e) {
    console.error(e.stack);
    console.error(e);
  }
}

module.exports = require('./init').bind(null, runTest);
