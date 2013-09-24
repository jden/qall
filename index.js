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
    throw new TypeError('first argument must be a function')
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
      try {
        r(fn.apply(ctx, args))
      } catch (err) {
        t(err)
      }
    }
    if (!args.length) {
      try {
        r(fn.call(ctx))
      } catch (err) {
        t(err)
      }
    }

  })

}

qall.await = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    args.unshift(fn)
    return qall.apply(this, args)
  }
}

qall.join = function () {
  var args = Array.prototype.slice.call(arguments)
  return Promise(function (r, t) {
    var remaining = args.length
    args = args.map(function (arg, i) {
      return P(arg).then(function (val) {
        args[i] = val
        remaining--
        if (!remaining) {
          r()
        }
      }, t)
    })
  })
}

// combinators

var toArray = Array.prototype.slice

// ∃x
qall.some = function () {
  var terms = toArray.call(arguments).map(P)
  if (!terms.length) {
    return PReject(new TypeError('Must have terms'))
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
    return PReject(new TypeError('Must have terms'))
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
    return PReject(new TypeError('Must have terms'))
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
    return PReject(new TypeError('Must have term'))
  }
  return P(term).then(function (t) {
    return !t
  })
}

// Array utils

// (Array<T>|Promise<Array<T>>, (T)=>Boolean|(T)=>Promise<Boolean>) => Promise<Array<T>>
qall.filter = function (arr, fn) {

  if (!arr) {
    return PReject(new TypeError('Must have array'))
  }
  if (typeof fn !== 'function') {
    return PReject(new TypeError('fn must be a Function'))
  }

  return P(arr).then(function (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('arr must be an Array')
    }

    return new Promise(function (r, t) {
      qall.map(arr, fn)
        .then(function (keep) {
          r(arr.filter(function (el, i) {
            return keep[i]
          }))
        }, t)
    })

  })
}

// (Array<T>|Promise<Array<T>>, (T)=>T2|(T)=>Promise<T2>) => Promise<Array<T2>>
qall.map = function (arr, fn) {
  if (!arr) {
    return PReject(new TypeError('Must have array'))
  }
  if (typeof fn !== 'function') {
    return PReject(new TypeError('fn must be a Function'))
  }

  return P(arr).then(function (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('arr must be an Array')
    }

    var remaining = arr.length
    return new Promise(function (r, t) {

      var mapped = arr.map(function (el, i) {
        return P(fn(el)).then(function (elMapped) {
          remaining--
          mapped[i] = elMapped
          if (!remaining) {
            done()
          }
        }, t)
      })

      function done() {
        r(mapped)
      }
      if (!arr.length) {
        r(mapped)
      }
    })

  })
}


module.exports = qall
module.exports.P = P