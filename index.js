function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex:bank']
    },
    sinkmap: {
      dependencies: ['allex:bank']
    }
  };
}

module.exports = createServicePack;

