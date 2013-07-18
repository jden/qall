# qall
lift functions of any arity into a Promises/A+ chain

## usage example
```js
var qall = require('qall')

function assertEq(x, y) {
    if(x !== y) {
      throw new Error()
    }
}

qall(assertEq,
  hashPass(pass)
  checkHashInDB(user)
  )
  .then(function () {
    console.log('ok!')
  }, function () {
    console.log('invalid user or pass')
  })
```


## api


`qall : (fn: Function, ...args: Promise|Any) => Promise`
resolved with the return value of `fn`


## installation

    $ npm install qall


## running the tests

From package root:

    $ npm install
    $ npm test

# about the name

Although similar in name to Q.all, the behavior is actually more similar to Q.spread but with a more functionally-inspired API. It should be pronounced like "call".

Lamentably, Promises/A+ doesn't conform to [Fantasy Land](https://github.com/puffnfresh/fantasy-land) monads, so this implementation is necessary, rather than a generic `liftN`.


## contributors

- jden <jason@denizac.org>


## license

MIT. (c) MMXIII jden <jason@denizac.org>. See LICENSE.md
