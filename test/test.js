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
})