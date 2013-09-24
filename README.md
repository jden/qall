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

`qall.await : (fn: Function<T>) => Function<Promise<T>>`
Wraps a `fn` to let any of its args be a promise. That is, it
curries `qall` with the `fn` parameter.

### combinators

`qall` includes boolean logic combinators which operate on promises:

`qall.some : (...terms : Promise<Boolean>) => Promise<Boolean>`

`qall.every : (...terms : Promise<Boolean>) => Promise<Boolean>`

`qall.not : (term : Promise<Boolean>) => Promise<Boolean>`

For explicit ordering control, for use with Lazy Promises:

`qall.someSerial : (...terms : Promise<Boolean>) => Promise<Boolean>`

`qall.everySerial : (...terms : Promise<Boolean>) => Promise<Boolean>`

### Array utils

`qall.map : (Array<T>|Promise<Array<T>>, (T)=>T2|(T)=>Promise<T2>) => Promise<Array<T2>>`

`qall.filter : (Array<T>|Promise<Array<T>>, (T)=>Boolean|(T)=>Promise<Boolean>) => Promise<Array<T>>`


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
