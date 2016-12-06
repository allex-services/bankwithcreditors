function createBankWithCreditorsService(execlib, ParentService, allexleveldbwithcreditorslib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    BankWithCreditorsMixin = allexleveldbwithcreditorslib.BankWithCreditorsMixin;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function BankWithCreditorsService(prophash) {
    ParentService.call(this, prophash);
    BankWithCreditorsMixin.call(this, prophash);
  }
  
  ParentService.inherit(BankWithCreditorsService, factoryCreator);
  BankWithCreditorsMixin.addMethods(BankWithCreditorsService);

  BankWithCreditorsService.prototype.__cleanUp = function() {
    BankWithCreditorsMixin.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };

  return BankWithCreditorsService;
}

module.exports = createBankWithCreditorsService;
