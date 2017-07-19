function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex:bank', 'allex_leveldbbankwithcreditorslib']
    },
    sinkmap: {
      dependencies: ['allex:bank']
    }
  };
}

module.exports = createServicePack;

