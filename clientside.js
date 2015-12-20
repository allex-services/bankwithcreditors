function createClientSide(execlib) {
  'use strict';
  var execSuite = execlib.execSuite,
  BankServicePack = execSuite.registry.get('allex_bankservice'),
  ParentServicePack = BankServicePack;

  return {
    SinkMap: require('./sinkmapcreator')(execlib, ParentServicePack)
  };
}

module.exports = createClientSide;
