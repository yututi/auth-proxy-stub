const proxy = require('express-http-proxy')
const express = require('express')
const app = express()
const { resolve } = require("path")
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser")
const session = require('express-session')

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

const PORT = 5000

passport.use(new LocalStrategy({
    usernameField: "userId",
    passwordField: "pwd"
}, (username, _, done) => {
    console.log(`username: ${username}`)
    return done(null, username)
}))
passport.serializeUser(function (user, done) {
    console.log("serialize", user)
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    console.log("deserialize", user)
    done(null, user);
});

app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(session({
    secret: 'abc',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use('/proxy', proxy('https://www.npmjs.com/', {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["X-USER-ID"] = srcReq.user
        return proxyReqOpts
    }
}))

app.get("/login", (req, res) => {
    res.sendFile(resolve(__dirname, "templates/login.html"))
})

app.post(
    "/login",
    passport.authenticate('local'),
    (req, res) => {
        let redirectTo = "/proxy"
        const {
            redirect_url
        } = req.query
        if (redirect_url) {
            redirectTo += redirect_url.startsWith("/") ? redirect_url : `/${redirect_url}`
        }
        res.redirect(redirectTo)
    }
)

app.listen(PORT, () => {
    console.log(`started at http://localhost:${PORT}`)
})