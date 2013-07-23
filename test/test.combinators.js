var chai = require('chai')
chai.should()
chai.use(require('chai-interface'))
var sinon = require('sinon')
chai.use(require('sinon-chai'))
var Promise = require('promise')
var K = require('ski/k')

// TODO: break this out into its own module
var callOrder = 0
var LazyPStub = function (val) {
  var called = false

  var stub = {
    then: function (res, rej) {
      called = true
      stub.order = callOrder
      callOrder++
      process.nextTick(function () {
        res(val)
      })
    },
    called: function () {
      return called
    },
    calledBefore: function (otherStub) {
      return called && (!otherStub.called() || stub.order < otherStub.order)
    }
  }

  return stub;
}


describe('qall combinators', function () {

  var qall = require('../index')
  var P = function (x) {
    return new Promise(function (resolve) {
      resolve(x)
    })
  }
  var PReject = function (x) {
    return new Promise(function (resolve, reject) {
      reject(x)
    })
  }

  it('has interface', function () {
    qall.should.have.interface({
      //someSerial: Function,
      some: Function,
      not: Function,
      everySerial: Function,
      every: Function
    })
  })

  describe('everySerial', function () {
    var everySerial = qall.everySerial

    it('is rejected if there are no terms', function (done) {
      everySerial().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves false if any of the terms is false', function (done) {
      var t1 = P(true)
      var t2 = P(false)

      everySerial(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('resolves true if all of the terms are true', function (done) {
      var t1 = P(true)
      var t2 = P(true)

      everySerial(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('executes terms in serial', function (done) {
      var t1 = LazyPStub(true)
      var t2 = LazyPStub(false)
      var t3 = LazyPStub(true)

      everySerial(t1, t2, t3).then(function () {
        t1.calledBefore(t2).should.equal(true)
        t2.calledBefore(t3).should.equal(true)
      }).then(done, done)
    })

    it('only executes terms necessary', function (done) {
      var t1 = LazyPStub(true)
      var t2 = LazyPStub(false)
      var t3 = LazyPStub(true)

      everySerial(t1, t2, t3).then(function () {
        t1.called().should.equal(true)
        t2.called().should.equal(true)
        t3.called().should.equal(false)
      }).then(done, done)
    })

    it('is rejected if any of the executed terms is rejected', function (done) {
      var err = new Error('foo')
      var t1 = P(true)
      var t2 = PReject(err)

      everySerial(t1, t2).then(function () {
        done(new Error('should not resolve'))
      }, function (e) {
        e.should.equal(err)
        done()
      })
    })

  })

  describe('someSerial', function () {
    var someSerial = qall.someSerial

    it('is rejected if there are no terms', function (done) {
      someSerial().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves true if any of the terms is true', function (done) {
      var t1 = P(false)
      var t2 = P(true)

      someSerial(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('resolves false if all of the terms are false', function (done) {
      var t1 = P(false)
      var t2 = P(false)

      someSerial(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('executes terms in serial', function (done) {
      var t1 = LazyPStub(false)
      var t2 = LazyPStub(false)
      var t3 = LazyPStub(true)

      someSerial(t1, t2, t3).then(function () {
        t1.calledBefore(t2).should.equal(true)
        t2.calledBefore(t3).should.equal(true)
      }).then(done, done)
    })

    it('only executes terms necessary', function (done) {
      var t1 = LazyPStub(false)
      var t2 = LazyPStub(true)
      var t3 = LazyPStub(true)

      someSerial(t1, t2, t3).then(function () {
        t1.called().should.equal(true)
        t2.called().should.equal(true)
        t3.called().should.equal(false)
      }).then(done, done)
    })

    it('is rejected if any of the executed terms is rejected', function (done) {
      var err = new Error('foo')
      var t1 = P(false)
      var t2 = PReject(err)

      someSerial(t1, t2).then(function () {
        done(new Error('should not resolve'))
      }, function (e) {
        e.should.equal(err)
        done()
      })
    })
  })

  describe('not', function () {
    var not = qall.not

    it('is rejected if there are no terms', function (done) {
      not().then(null, function () { done() })
    })

    it('returns true when the term is false', function (done) {
      not(P(false)).then(function (val) { val.should.equal(true)}).then(done, done)
    })

    it('returns false when the term is true', function (done) {
      not(P(true)).then(function (val) { val.should.equal(false)}).then(done, done)
    })
  })

  describe('some', function () {
    var some = qall.some

    it('is rejected if there are no terms', function (done) {
      some().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves true if any of the terms is true', function (done) {
      var t1 = K(P(true))
      var t2 = K(P(false))

      some(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('resolves false if all of the terms are false', function (done) {
      var t1 = P(false)
      var t2 = P(false)

      some(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('executes all terms in parallel', function (done) {
      var t1 = LazyPStub(true)
      var t2 = LazyPStub(false)
      var t3 = LazyPStub(true)

      some(t1, t2, t3).then(function () {
        t1.called().should.equal(true)
        t2.called().should.equal(true)
        t3.called().should.equal(true)
      }).then(done, done)
    })

  })

  describe('every', function () {
    var every = qall.every

    it('is rejected if there are no terms', function (done) {
      every().then(null, function (err) {
        err.should.be.instanceof(Error)
      }).then(done, done)
    })

    it('resolves false if any of the terms is false', function (done) {
      var t1 = P(true)
      var t2 = P(false)

      every(t1, t2).then(function (val) {
        val.should.equal(false)
      }).then(done, done)
    })

    it('resolves true if all of the terms are true', function (done) {
      var t1 = P(true)
      var t2 = P(true)

      every(t1, t2).then(function (val) {
        val.should.equal(true)
      }).then(done, done)
    })

    it('executes all terms in parallel', function (done) {
      var t1 = LazyPStub(true)
      var t2 = LazyPStub(false)
      var t3 = LazyPStub(true)

      every(t1, t2, t3).then(function () {
        t1.called().should.equal(true)
        t2.called().should.equal(true)
        t3.called().should.equal(true)
      }).then(done, done)
    })

  })


})