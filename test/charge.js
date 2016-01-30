function runTest(execlib, service) {
  'use strict';
  try {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    account = process.argv[3],
    amount = parseInt(process.argv[4]),
    desc;
  console.log('amount', amount);
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
  desc = amount > 0 ? 'payment' : 'income';
  //qlib.promise2console(service.charge('5', amount, ['bla']), 'charge'); //by default, referenceUserNames are ['String']
  service.charge(account, amount, [desc]).then(
    qlib.executor(service.dumpToConsole.bind(service))
  );
  } catch(e) {
    console.error(e.stack);
    console.error(e);
  }
}

module.exports = require('./init').bind(null, runTest);
