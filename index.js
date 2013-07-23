var Promise = require('promise')

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

// combinators

var toArray = Array.prototype.slice

// ∃x
qall.some = function () {
  var terms = toArray.call(arguments).map(P)
  if (!terms.length) {
    return PReject(new Error('Must have terms'))
  }
  var remaining = terms.length
  return new Promise(function (resolve, reject) {
    terms.forEach(function (term) {
      term.then(function (val) {
        if (val) {
          resolve(true)
        } else {
          remaining--
          if (!remaining) {
            resolve(false)
          }
        }
      }, reject)
    })
  })
}

qall.someSerial = function () {
  var terms = toArray.call(arguments)
  if (!terms.length) {
    return PReject(new Error('Must have terms'))
  }
  var head = terms[0]
  var remainder = terms.slice(1)
  return new Promise(function (resolve, reject) {
    P(head).then(function (val) {
      if (val) {
        resolve(true)
      } else {
        if (remainder.length) {
          qall.someSerial.apply(qall, remainder).then(resolve, reject)
        } else {
          resolve(false)
        }
      }
    }, reject)
  })
}

// ∀x
qall.every = function () {
  var terms = toArray.call(arguments).map(P)
  if (!terms.length) {
    return PReject(new Error('Must have terms'))
  }
  var remaining = terms.length
  return new Promise(function (resolve, reject) {
    terms.forEach(function (term) {
      term.then(function (val) {
        if (!val) {
          resolve(false)
        } else {
          remaining--
          if (!remaining) {
            resolve(true)
          }
        }
      }, reject)
    })
  })
}

qall.everySerial = function () {
  var terms = toArray.call(arguments)
  if (!terms.length) {
    return PReject(new Error('Must have terms'))
  }
  var head = terms[0]
  var remainder = terms.slice(1)
  return new Promise(function (resolve, reject) {
    P(head).then(function (val) {
      if (!val) {
        resolve(false)
      } else {
        if (remainder.length) {
          qall.everySerial.apply(qall, remainder).then(resolve, reject)
        } else {
          resolve(true)
        }
      }
    }, reject)
  })
}

// ¬x
qall.not = function (term) {
  if (!term) {
    return PReject(new Error('Must have term'))
  }
  return P(term).then(function (t) {
    return !t
  })
}

module.exports = qall
module.exports.P = P