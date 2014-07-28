# Legio-Async

Tools for asynchronous programming.

**Installation:**
```
npm install legio-async
```

**Compatible with:**
- Node.js
- Browserify

**Modules:**
- legio-async
  - task
  - promise
  - interval
  - timeout

**TODO:**
- The async/await syntax using generators

## legio-async
```javascript
Async
  denodeify(fn, that?) -> {(...) -> Promise}
```

## legio-async/task
```javascript
Task
  run(fn)
```

## legio-async/promise
```javascript
Promise()
  all(list: Promise[]) -> Promise
  allDone(list: Promise[]) -> Promise
  when(thenable) -> Promise
  prototype
    pending: Boolean
    awaiting: Object
    resolved: Boolean
    rejected: Boolean

    then(onFulfilled, onRejected) -> Promise
    notified(onNotified) -> this
    fail(onRejected) -> Promise
    always(handler) -> Promise

    resolve(value)
    fulfill(value) -> Boolean
    reject(reason) -> Boolean
    notify(argument) -> Boolean

    bindResolve(value?) -> Function
    bindFulfill(value?) -> Function
    bindReject(reason?) -> Function
    bindNotify(argument?) -> Function

    nodeifyThen(callback) -> Promise
    nodeifyResolve() -> Function
```

## legio-async/interval
```javascript
Interval(fn, time, wrap: Boolean)
  start(time, immediately: Boolean) -> Promise
  prototype
    activate(immediately: Boolean, time)
    suspend()
```

## legio-async/timeout
```javascript
Timeout(fn, time, wrap: Boolean)
  start(time) -> Promise
  prototype
    start(time)
    cancel()
```
