function runTest(execlib, service) {
  try {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;
  qlib.promise2console(
    service.ensure('10', 10000, ['ensure1']).then(
      service.charge.bind(service, '10', -130, ['uplata'])
    ).then(
      service.charge.bind(service, '10', 10000, ['isplata'])
    ).then(
      service.ensure.bind(service, '10', 10000, 'ensure2')
    ).then(
      console.log.bind(console, 'estimate')
    ).then(
      qlib.executor(service.dumpToConsole.bind(service))
    ).then(
      qlib.executor(service.dumpToConsole.bind(service, {filter: service.isAccount}))
    ),
    'ensure n charge'
  ); //by default, referenceUserNames are ['String']
  } catch(e) {
    console.error(e.stack);
    console.error(e);
  }
}

module.exports = require('./init').bind(null, runTest);
