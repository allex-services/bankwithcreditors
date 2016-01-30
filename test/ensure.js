function runTest(execlib, service) {
  try {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    account = process.argv[3],
    amount = parseInt(process.argv[4]);
  if (!account) {
    console.error('no account');
    process.exit(1);
    return;
  }
  if (!(!isNaN(amount) && amount)) {
    console.error(amount, 'is wrong');
    process.exit(1);
    return;
  }
  qlib.promise2console(service.ensure(account, amount, ['ensure']).then(
    service.dumpToConsole.bind(service)
  ), 'ensure'); //by default, referenceUserNames are ['String']
  } catch(e) {
    console.error(e.stack);
    console.error(e);
  }
}

module.exports = require('./init').bind(null, runTest);
