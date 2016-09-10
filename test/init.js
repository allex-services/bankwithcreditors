function instantiateService(cb, execlib, Service) {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    d = q.defer(),
    service = new Service({path: 'bank', __readyToAcceptUsers: d});

  d.promise.then(
    cb.bind(null, execlib, service),
    process.exit.bind(process, 2)
  );
}

function init(cb, execlib) {
  execlib.loadDependencies('server', ['allex:bankwithcreditors'], instantiateService.bind(null, cb, execlib)).then(
    null,
    process.exit.bind(process, 1)
  );
}

module.exports = init;
