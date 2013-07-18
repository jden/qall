var Promise = require('promise')

var P = function (x) {
  return new Promise(function (resolve) {
    resolve(x)
  })
}

function qall (fn) {
  var ctx = this
  if (typeof fn !== 'function') {
    throw new Error('first argument must be a function')
  }

  var args = Array.prototype.slice.call(arguments, 1)


  return Promise(function (r, t) {

    var remaining = args.length
    args = args.map(function (arg, i) {
      return P(arg).then(function (val) {
        args[i] = val
        remaining--
        if (!remaining) {
          done()
        }
      }, t)
    })

    function done() {
      r(fn.apply(ctx, args))
    }
    if (!args.length) {
      r(fn.call(ctx))
    }

  })

}

module.exports = qall
module.exports.P = P