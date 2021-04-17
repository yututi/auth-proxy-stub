const proxy = require('express-http-proxy')
const express = require('express')
const app = express()
const { resolve } = require("path")
const cookieParser = require('cookie-parser')
const session = require('express-session')
require('dotenv').config()

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

// Env variables
const PROXY_HOST = env.PROXY_HOST || "http://localhost:8080/"
const HEADER_KEY_NAME = env.HEADER_KEY_NAME || "X-USER-ID"
const PROXY_BASE_URL = env.PROXY_BASE_URL || "/proxy"
const PORT = env.PORT || 5000

// Passport config
passport.use(new LocalStrategy({
    usernameField: "userId",
    passwordField: "userId" // ignore password.
}, (username, _, done) => {
    return done(null, username)
}))
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

// Middleware config
app.use(cookieParser())
app.use(express.urlencoded())
app.use(session({
    secret: 'abc',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(PROXY_BASE_URL, proxy(PROXY_HOST, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers[HEADER_KEY_NAME] = srcReq.user
        return proxyReqOpts
    }
}))

// Route config
app.get("/login", (req, res) => {
    res.sendFile(resolve(__dirname, "templates/login.html"))
})

app.post(
    "/login",
    passport.authenticate('local'),
    (req, res) => {
        let redirectTo = PROXY_BASE_URL
        const {
            redirect_url
        } = req.query
        if (redirect_url) {
            redirectTo += redirect_url.startsWith("/") ? redirect_url : `/${redirect_url}`
        }
        res.redirect(redirectTo)
    }
)

//
app.listen(PORT, () => {
    console.log(`started at http://localhost:${PORT}`)
})