socket.io-cookie
================

Cookie parser middleware for socket.io

### Example

```Javascript
var cookieParser = require('socket.io-cookie');
var server = require('http').Server();
var io = require('socket.io')(server);

// after this cookies are parsed
io.use(cookieParser);

// use cookies from some middleware
io.use(function (socket, next) {
  console.log(socket.request.headers.cookie.someCookie);
});

// you can use parsed cookies on your namespaces also
io.of('/namespace').use(function (socket, next) {
  console.log(socket.request.headers.cookie.someCookie);
});
```

# License
**MIT**
