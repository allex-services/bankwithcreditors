function createBankWithCreditorsService(execlib, ParentServicePack) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    ParentService = ParentServicePack.Service;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function BankWithCreditorsService(prophash) {
    ParentService.call(this, prophash);
  }
  
  ParentService.inherit(BankWithCreditorsService, factoryCreator);

  BankWithCreditorsService.prototype.superReadAccount = function (username) {
    return ParentService.prototype.readAccount.call(this, username);
  };

  BankWithCreditorsService.prototype.readAccount = function (username) {
    return q.all([
      this.superReadAccount(username),
      this.readAccountWDefault(username+'_creditor', [0])
    ]).spread(
      this.accountSummer.bind(this)
    );
  };

  BankWithCreditorsService.prototype.accountSummer = function (myaccount, creditoraccount) {
    return q([myaccount[0]+creditoraccount[0]]);
  };

  BankWithCreditorsService.prototype.superCharge = function (username, amount, referencearry) {
    return ParentService.prototype.superCharge.call(this, username, amount, referencearry);
  };

  BankWithCreditorsService.prototype.charge = function (username, amount, referencearry) {
    try {
      console.log('charge!, username', username, 'amount', amount);
    if (amount>0) {
      return this.locks.run(username+'--chargecombo--', new qlib.PromiseChainerJob([
        this.superReadAccount.bind(this, username),
        this.accountChecker.bind(this, username, amount, referencearry)
      ]));
    }
    return this.locks.run(username+'--chargecombo--', new qlib.PromiseChainerJob([
      this.readAccountWDefault.bind(this, username+'_creditor', [0]),
      this.creditorAccountChecker.bind(this, username, amount, referencearry)
    ])); 
    } catch(e) {
      console.error(e.stack);
      console.error(e);
    }
  };

  BankWithCreditorsService.prototype.accountChecker = function (username, amount, referencearry, account) {
    console.log('accountChecker, username', username, 'amount', amount, 'account', account);
    if (account[0] < amount) {
      return q.all([
        this.superCharge(username, account[0], referencearry),
        this.superCharge(username+'_creditor', account[0] - amount, referencearry)
      ]).spread(
        this.chargeSummer.bind(this)
      );
    }
    return this.superCharge(username, amount, referencearry);
  };

  BankWithCreditorsService.prototype.creditorAccountChecker = function (username, amount, referencearry, creditoraccount) {
    console.log('creditorAccountChecker, username', username, 'amount', amount, 'account', account);
    if (creditoraccount[0] < -amount) {
      return q.all([
        this.superCharge(username+'_creditor', account[0], referencearry),
        this.superCharge(username, account[0] + amount, referencearry)
      ]).spread(
        this.chargeSummer.bind(this)
      );
    }
    return this.superCharge(username+'_creditor', -amount, referencearry);
  };

  BankWithCreditorsService.prototype.chargeSummer = function (mycharge, creditorcharge) {
    console.log('chargeSummer', mycharge, creditorcharge);
  };
  
  BankWithCreditorsService.prototype.__cleanUp = function() {
    ParentService.prototype.__cleanUp.call(this);
  };
  
  return BankWithCreditorsService;
}

module.exports = createBankWithCreditorsService;
