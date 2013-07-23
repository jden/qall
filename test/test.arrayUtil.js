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

describe('Array utils', function () {
  var qall = require('../')

  describe('qall.filter', function () {

    it('is a function', function () {
      qall.filter.should.be.a('function')
    })

    it('throws without arr', function (done) {
      qall.filter(null, function () {}).then(function () {
        throw new Error('should not be resolved')
      }, function (err) {
        err.should.be.instanceof(Error)
      })
      .then(done, done)
    })

    it('throws if arr is not eventually an Array', function (done) {
      qall.filter(3, function () {})
      .then(function () {
        throw new Error('should not be resolved')
      }, function (err) {
        err.should.be.instanceof(Error)
        err.message.should.equal('arr must be an Array')
      })
      .then(done, done)
    })

    it('throws if fn is not a function', function (done) {
      qall.filter([]).then(function () {
        throw new Error('should not be resolved')
      }, function (err) {
        err.should.be.instanceof(Error)
      })
      .then(done, done)
    })

    it('filters', function (done) {
      var numbers = [0,1,2,3,4,5,6]

      function even(n) {
        return n % 2 === 0
      }

      qall.filter(numbers, even)
      .then(function (filtered) {
        filtered.should.deep.equal([0, 2,4,6])
      })
      .then(done, done)

    })

    it('awaits', function (done) {
      var numbers = [0,1,2,3,4,5,6]

      function pass(n) {
        return P(n % 2 === 0)
      }

      qall.filter(numbers, pass)
      .then(function (filtered) {
        filtered.should.deep.equal([0,2,4,6])
      })
      .then(done, done)

    })

  })

  describe('qall.map', function () {

    it('is a function', function () {
      qall.map.should.be.a('function')
    })

    it('throws without arr', function (done) {
      qall.map(null, function () {}).then(function () {
        throw new Error('should not be resolved')
      }, function (err) {
        err.should.be.instanceof(Error)
      })
      .then(done, done)
    })

    it('throws if arr is not eventually an Array', function (done) {
      qall.map(3, function () {})
      .then(function () {
        throw new Error('should not be resolved')
      }, function (err) {
        err.should.be.instanceof(Error)
        err.message.should.equal('arr must be an Array')
      })
      .then(done, done)
    })

    it('throws if fn is not a function', function (done) {
      qall.map([]).then(function () {
        throw new Error('should not be resolved')
      }, function (err) {
        err.should.be.instanceof(Error)
      })
      .then(done, done)
    })

    it('maps', function (done) {
      var arr = [1,2,3,4]
      qall.map(arr, function (n) { return n*2})
      .then(function (res) {
        res.should.deep.equal([2,4,6,8])
      })
      .then(done, done)
    })

    it('awaits', function (done) {
      var arr = P([1,2,3,4])
      qall.map(arr, function (n) { return P(n*2) })
      .then(function (res) {
        res.should.deep.equal([2,4,6,8])
      })
      .then(done, done)
    })

  })


})
