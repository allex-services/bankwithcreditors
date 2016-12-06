function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex:bank', 'allex:leveldbbankwithcreditors:lib']
    },
    sinkmap: {
      dependencies: ['allex:bank']
    }
  };
}

module.exports = createServicePack;

