var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var config = require('config')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var i18n = require('i18n')
var db = require('./db')

var index = require('./routes/index')

var app = express()

app.locals.pretty = true
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
global.config = config
global.config.NODE_ENV = app.get('env')
i18n.configure({
    locales: config.languages,
    defaultLocale: config.defaultLang,
    cookie: 'lang',
    queryParameter: 'lang',
    directory: __dirname + '/locales',
    autoReload: true,
    updateFiles: true,
    register: global
})
app.use(i18n.init)
app.use(
    session({
        secret: config.cookieSecret,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: db.mongoose.connection,
            ttl: 2 * 24 * 60 * 60
        })
    })
)

app.use((req,res,next)=>{
  res.header ('Access-Control-Allow-Origin', '*')
  res.header ('Access-Control-Allow-Credentials', true)
  res.header ('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.header ('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.use(require('./modules/loadUser'))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
