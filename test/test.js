var chai = require('chai')
chai.should()
var Promise = require('promise')
var sinon = require('sinon')
chai.use(require('sinon-chai'))

var P = function (x) {
  return new Promise(function (resolve) {
    resolve(x)
  })
}
var R = function (x) {
  return new Promise(function (resolve, reject) {
    reject(x)
  })
}

describe('qall', function () {
  var qall = require('../')

  it('example', function (done) {
    var eq = function (a, b) {
      return a === b
    }

    qall(eq, P(1), P(2))
    .then(function (val) {
      val.should.equal(false)
    })
    .then(done, done)

  })


  it('example', function (done) {
    var eq = function (a, b) {
      return a === b
    }

    qall(eq, P(23), P(23))
    .then(function (val) {
      val.should.equal(true)
    })
    .then(done, done)

  })

  it('calls fn once promised args are resolved', function (done) {
    var fn = sinon.spy()
    qall(fn, P(1), P(2), P('three'))
    .then(function (){
      fn.should.have.been.calledWithExactly(1,2,'three')
    })
    .then(done, done)
  })

  it('is rejected without calling the fn if any of the args is rejected', function (done) {
    var fn = sinon.spy()
    qall(fn, P(1), R('rejected arg'), P('three'))
    .then(function () {
      throw new Error('should not have been resolved')
    }, function (err){
      err.should.equal('rejected arg')
      fn.should.not.have.been.called
    })
    .then(done, done)
  })

  it('throws if first arg is not a function', function () {
    chai.expect(function () {
      qall()
    }).to.throw
    chai.expect(function () {
      qall(1)
    }).to.throw
  })

  it('fn can be nullary', function (done) {
    var fn = function () { return 108 }
    qall(fn)
    .then(function (val){
      val.should.equal(108)
    })
    .then(done, done)
  })

  it('passes through its `this` context to fn', function (done) {
    var ctx = {}
    var fn = sinon.spy()
    qall.call(ctx, fn)
    .then(function (){
      fn.should.have.been.calledOn(ctx)
    })
    .then(done, done)
  })

    it('catches thrown errors into rejections', function (done) {
      var add = function (a, b) {
        throw new Error('foo')
      }

      qall(add, 1, 2).then(function (val) {
        throw new Error('should not resolve')
      }, function (err) {
        err.message.should.equal('foo')
      })
      .then(done, done)
    })

  describe('.await', function () {
    it('wraps a fn to let any of its args be a promise', function (done) {
      // that is, it curries `qall` with the `fn` parameter

      var add = function (a, b) {
        return a + b
      }

      var addAsync = qall.await(add)

      addAsync(1, P(5)).then(function (val) {
        val.should.equal(6)
      })
      .then(done, done)
    })
  })

  describe('.join', function () {
    it('joins multiple threads of execution and returns a promise', function (done) {
      var a = P(1).then(function () { a.resolved = true })
      var b = P(2).then(function () { b.resolved = true })
      var c = Promise(function (resolve) {
        setTimeout(function (){
          resolve(3)
        }, 10)
      })
      c.then(function () { c.resolved = true })

      qall.join(a, b, c)
        .then(function (val) {
          chai.expect(val).to.equal(undefined)
          a.resolved.should.equal(true)
          b.resolved.should.equal(true)
          c.resolved.should.equal(true)
        })
        .then(done, done)
    })

    it('joins an array of promises', function (done) {
      var a = P(1).then(function () { a.resolved = true })
      var b = P(2).then(function () { b.resolved = true })
      var c = P(3).then(function () { c.resolved = true })

      var promises = [a,b,c]

      var joined = qall.join(promises)

      joined.then(function (val) {
          chai.expect(val).to.equal(undefined)
          a.resolved.should.equal(true)
          b.resolved.should.equal(true)
          c.resolved.should.equal(true)
        })
        .then(done, done)
    })

  })

})