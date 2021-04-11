const proxy = require('express-http-proxy')
const express = require('express')
const app = express()

var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use('/proxy', proxy('https://www.npmjs.com/'))

app.use(express.static('public'))
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxage: 1000 * 60 * 30
        }
    })
)

app.post("/login", req => {
    
})

app.listen(8080, () => {
    console.log("started")
})