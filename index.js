function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex_bankservice', 'allex_leveldbbankwithcreditorslib']
    },
    sinkmap: {
      dependencies: ['allex_bankservice']
    }
  };
}

module.exports = createServicePack;

