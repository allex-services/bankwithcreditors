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

  var _creditorsuffix = '_creditor',
    _creditorsuffixlength = _creditorsuffix.length;

  BankWithCreditorsService.prototype.readCreditor = function (username) {
    return this.readAccountWDefault(username+_creditorsuffix, [0]);
  };

  BankWithCreditorsService.prototype.chargeCreditor = function(username, amount, referencearry) {
    return this.superCharge(username+_creditorsuffix, amount, referencearry);
  };

  BankWithCreditorsService.prototype.readAccount = function (username) {
    return q.all([
      this.readAccountWDefault(username, [0]),
      this.readCreditor(username)
    ]).spread(
      this.accountSummer.bind(this)
    );
  };

  BankWithCreditorsService.prototype.accountSummer = function (myaccount, creditoraccount) {
    return q([myaccount[0]+creditoraccount[0]]);
  };

  BankWithCreditorsService.prototype.superCharge = function (username, amount, referencearry) {
    return ParentService.prototype.charge.call(this, username, amount, referencearry);
  };

  BankWithCreditorsService.prototype.readBoth = function (username, cb) {
    return q.all([
      this.readAccountWDefault(username, [0]),
      this.readCreditor(username)
    ]).spread(cb);
  };
  BankWithCreditorsService.prototype.charge = function (username, amount, referencearry) {
    try {
      //console.log('charge!, username', username, 'amount', amount);
    if (amount>0) {
      return this.locks.run(username+'--chargecombo--', new qlib.PromiseChainerJob([
        this.readBoth.bind(this, username, this.accountChecker.bind(this, username, amount, referencearry))
      ]));
    }
    return this.locks.run(username+'--chargecombo--', new qlib.PromiseChainerJob([
      this.readCreditor.bind(this, username),
      this.creditorAccountChecker.bind(this, username, amount, referencearry)
    ])); 
    } catch(e) {
      console.error(e.stack);
      console.error(e);
    }
  };

  BankWithCreditorsService.prototype.accountChecker = function (username, amount, referencearry, account, creditoraccount) {
    console.log('accountChecker, username', username, 'amount', amount, 'account', account, 'creditoraccount', creditoraccount);
    var creditorextra, ops;
    if (account[0] < amount) {
      creditorextra = creditoraccount[0] + account[0] - amount;
      console.log('first the superCharge');
      ops = [
        this.superCharge(username, account[0], referencearry),
      ];
      if (creditorextra < 0) {
        console.log('then chargeCreditor');
        ops.push(this.chargeCreditor(username, creditorextra, referencearry));
      }
      return q.all(ops).spread(
        this.outMoneyChargeSummer.bind(this)
      );
    }
    console.log('going for superCharge', amount);
    return this.superCharge(username, amount, referencearry);
  };

  BankWithCreditorsService.prototype.creditorAccountChecker = function (username, amount, referencearry, creditoraccount) {
    try {
    var creditormoney = creditoraccount[0];
    if (creditormoney < -amount) {
      if (creditormoney) {
        return q.all([
          this.chargeCreditor(username, creditormoney, referencearry),
          this.superCharge(username, amount, referencearry)
        ]).spread(
          this.inMoneyChargeSummer.bind(this)
        );
      } else {
        return this.superCharge(username, amount, referencearry);
      }
    }
    return q.all([
      this.chargeCreditor(username, -amount, referencearry),
      this.superCharge(username, amount, referencearry)
    ]).spread(
      this.inMoneyChargeSummer.bind(this)
    );
    } catch(e) {
      console.error(e.stack);
      console.error(e);
    }
  };

  BankWithCreditorsService.prototype.outMoneyChargeSummer = function (mycharge, creditorcharge) {
    console.log('outMoneyChargeSummer', mycharge, creditorcharge);
    var ret = 0;
    if (lib.isArray(mycharge) && mycharge.length>1) {
      ret += mycharge[1];
    }
    if (lib.isArray(creditorcharge) && creditorcharge.length>1) {
      ret += creditorcharge[1];
    }
    return q(ret);
  };

  BankWithCreditorsService.prototype.inMoneyChargeSummer = function (creditorcharge, mycharge) {
    console.log('inMoneyChargeSummer', creditorcharge, mycharge);
    var ret = 0;
    if (lib.isArray(mycharge) && mycharge.length>1) {
      ret += mycharge[1];
    }
    if (lib.isArray(creditorcharge) && creditorcharge.length>1) {
      ret += creditorcharge[1];
    }
    return q(ret);
  };
  
  BankWithCreditorsService.prototype.__cleanUp = function() {
    ParentService.prototype.__cleanUp.call(this);
  };

  BankWithCreditorsService.prototype.ensure = function (username, amount, referencearry) {
    if (amount < 0) {
      return q.reject(new lib.Error('AMOUNT_FOR_ENSURE_CANNOT_BE_NEGATIVE', amount));
    }
    return q.all([
      this.readAccountWDefault(username, [0]),
      this.readCreditor(username)
    ]).spread(
      this.onAccountForEnsure.bind(this, username, amount, referencearry)
    );
  };

  BankWithCreditorsService.prototype.onAccountForEnsure = function (username, amount, referencearry, myaccount, creditoraccount) {
    try {
    var mymoney = myaccount[0],
      creditormoney = creditoraccount[0],
      totalmoney = mymoney + creditormoney,
      missing = amount-totalmoney;
    if (missing > 0) {
      return this.chargeCreditor(username, -missing, referencearry).then(qlib.returner(amount));
    } else {
      return q(amount);
    }
    } catch(e) {
      console.error(e.stack);
      console.error(e);
    }
  };

  BankWithCreditorsService.prototype.estimate = function (username, amountdelta) {
    return q.all([
      this.readAccountWDefault(username, [0]),
      this.readCreditor(username)
    ]).spread(
      this.estimator.bind(this, amountdelta)
    );
  };

  BankWithCreditorsService.prototype.estimator = function (amountdelta, myaccount, creditoraccount) {
    var extra = amountdelta - creditoraccount[0];
    if (extra < 0) {
      return [creditoraccount[0] + myaccount[0]];
    }
    return [creditoraccount[0] + myaccount[0] + extra];
  };

  BankWithCreditorsService.prototype.isAccount = function (item) {
    return (item && item.key && item.key.substr && item.key.substr(-_creditorsuffixlength) !== _creditorsuffix);
  }

  BankWithCreditorsService.prototype.traverseAccounts = function (options) {
    options = options || {};
    options.filter = this.isAccount;
    return this.accounts.traverse(options);
  };
  
  return BankWithCreditorsService;
}

module.exports = createBankWithCreditorsService;
