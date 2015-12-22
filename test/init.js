function instantiateService(cb, execlib, bwcservicepack) {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    Service = bwcservicepack.Service,
    d = q.defer(),
    service = new Service({path: 'bank', __readyToAcceptUsers: d});

  d.promise.then(
    cb.bind(null, execlib, service),
    process.exit.bind(process, 2)
  );
}

function init(cb, execlib) {
  execlib.execSuite.registry.register('allex_bankwithcreditorsservice').then(
    instantiateService.bind(null, cb, execlib),
    process.exit.bind(process, 1)
  );
}

module.exports = init;
