const request = require('request'),
    sendMail = require('../modules/sendMail'),
    crypto = require('crypto'),
    db = require('../db')

module.exports.auth = (req, res, next) => {
    if (!('email' in req.body) || !('password' in req.body)) {
        req.flash('error', res.__('Не все данные заполнены.'))
        return res.status(400).render('msg/msg')
    }
    if (!/^\w+([\.\w]+)*\w@\w((\.\w)*\w+)*\.\w{2,10}$/.test(req.body.email)) {
        req.flash('error', res.__('Некорректный емейл адрес.'))
        return res.status(400).render('msg/msg')
    }
    if (req.body.email in config.security && config.security[req.body.email].count >= 5 && Date.now() - config.security[req.body.email].dt < 180000) {
        let min = (180000 - (Date.now() - config.security[req.body.email].dt)) / 1000 / 60
        req.flash('error', res.__('Подозрение на подбор пароля, продолжить можно будет через %s мин', min.toFixed(2)))
        return res.status(403).render('msg/msg')
    } else if (req.body.email in config.security && Date.now() - config.security[req.body.email].dt > 180000) delete config.security[req.body.email]
    db.User.findOne({email: req.body.email}, (e, user) => {
        if (e) {
            req.flash('error', res.__('Ошибка сервера.'))
            return res.status(500).render('msg/msg')
        }
        if (!user || !user.checkPassword(req.body.password)) {
            if (!(req.body.email in config.security)) config.security[req.body.email] = {dt: Date.now(), count: 1}
            else {
                config.security[req.body.email].count++
                config.security[req.body.email].dt = Date.now()
            }
            req.flash('error', res.__('Авторизация не прошла.'))
            return res.status(400).render('msg/msg')
        }

        if (user._id in config.control && config.control[user._id] != req.session.id) {
            req.sessionStore.destroy(config.control[user._id], e => {
                if (e) return res.status(500).end(res.__('Ошибка сессии.'))
                config.control[user._id] = req.session.id
                req.session.user = user._id
                if (req.body.email in config.security) delete config.security[req.body.email]
                res.sendStatus(200)
            })
        } else {
            config.control[user._id] = req.session.id
            req.session.user = user._id
            if (req.body.email in config.security) delete config.security[req.body.email]
            res.sendStatus(200)
        }
    })
}

module.exports.register = (req, res, next) => {
    if (!('g-recaptcha-response' in req.body) || !req.body['g-recaptcha-response']) {
        req.flash('error', res.__('Не разгадана reCAPTCHA.'))
        return res.status(400).render('msg/msg')
    }
    request.post(
        {
            url: 'https://www.google.com/recaptcha/api/siteverify',
            form: {
                secret: config.reCaptchaPriv,
                response: req.body['g-recaptcha-response']
            }
        },
        (e, httpResponse, body) => {
            if (e) {
                console.log(e)
                req.flash('error', res.__('Не разгадана reCAPTCHA.'))
                return res.status(500).render('msg/msg')
            }
            const google = JSON.parse(body)
            if (!('success' in google) || google.success !== true) {
                req.flash('error', res.__('Не разгадана reCAPTCHA.'))
                return res.status(400).render('msg/msg')
            }
            req.checkBody('email', res.__('Некорректный емейл адрес.')).isEmail()
            req.checkBody('password', res.__('Пароль не может быть пустым.')).notEmpty()
            const errors = req.validationErrors()
            if (errors) {
                for (let i = 0, n = errors.length; i < n; i++) {
                    req.flash('error', errors[i])
                }
                return res.status(400).render('msg/msg')
            }
            db.User.findOne({email: req.body.email})
                .then(user => {
                    if (user) {
                        req.flash('error', res.__('Емейл адрес уже зарегистрирован.'))
                        return res.status(500).render('msg/msg')
                    }
                    user = new db.User({
                        email: req.body.email,
                        password: req.body.password
                    })
                    user.token = crypto
                        .createHmac('sha256', Date.now().toString())
                        .update(user.email)
                        .digest('hex')
                    user.apiToken = crypto
                        .createHmac('sha256', Date.now().toString())
                        .update(Date.now() + user.email)
                        .digest('hex')
                    if ('ref' in req.cookies) user.ref = db.mongoose.Types.ObjectId.isValid(req.cookies.ref) ? req.cookies.ref : null

                    user.save(function (e, user) {
                        if (e) {
                            console.log(e)
                            req.flash('error', res.__('Ошибка сервера.'))
                            return res.status(500).render('msg/msg')
                        }
                        req.session.user = user._id
                        if (global.config.emailSendEnable) {
                            sendMail(user.email, `${res.__('Регистрация на сайте')} ${global.config.host}`, `${res.__('Верифицируйте свой')} <a href="${global.config.origin}/email/${user.token}" target="_blank">${res.__('емейл адрес')}</a>`, (e, d) => {
                                if (e) {
                                    console.log(e)
                                    req.flash('error', res.__('Не удалось отправить письмо для верификации на Вашу почту.'))
                                } else {
                                    req.flash('ok', res.__('Регистрация прошла успашно. Проверьте Вашу почту.'))
                                }
                                console.log('EMAIL INFO', d)
                                return res.render('msg/msg')
                            })
                        } else {
                            req.flash('ok', res.__('Регистрация прошла успашно.'))
                            return res.render('msg/msg')
                        }
                    })
                })
                .catch(e => {
                    console.log(e)
                    req.flash('error', res.__('Ошибка сервера.'))
                    return res.status(500).render('msg/msg')
                })
        }
    )
}

module.exports.logout = (req, res, next) => {
    req.session.destroy(e => {
        if (e) return res.sendStatus(500)
        res.sendStatus(200)
    })
}

module.exports.access = (req, res, next) => {
    if (req.user) return res.status(400).send({status: 'error', massage: res.__('Вы уже авторизованы.')})
    if (!('email' in req.body) || !('g-recaptcha-response' in req.body) || !req.body['g-recaptcha-response']) return res.status(400).send({
        status: 'error',
        massage: res.__('Не все данные получены.')
    })

    db.User.findOne({email: req.body.email.trim().toLowerCase()})
        .then(user => {
            if (!user) {
                req.flash('info', res.__('Емейл не зарегистрирован.'))
                return res.status(403).render('msg/msg')
            }
            request.post(
                {
                    url: 'https://www.google.com/recaptcha/api/siteverify',
                    form: {
                        secret: '6LfuwAgUAAAAAHn_zkBg3twATgGVeohNgJHVt1q7',
                        response: req.body['g-recaptcha-response']
                    }
                },
                (e, r, b) => {
                    if (e) {
                        console.log(e)
                        req.flash('error', res.__('Ошибка сервера.'))
                        return res.status(500).render('msg/msg')
                    }
                    let google = JSON.parse(b)
                    if (!('success' in google) || google.success != true) {
                        req.flash('error', res.__('Не правильно разгадана reCAPTCHA.'))
                        return res.status(500).render('msg/msg')
                    }
                    user.updatedAt = Date.now()
                    user.token = crypto
                        .createHmac('sha256', Date.now().toString())
                        .update(user.email)
                        .digest('hex')
                    user
                        .save()
                        .then(user => {
                            sendMail(user.email, res.__('Восстановление доступа на сайте') + ' ' + config.host, res.__('Для восстановления доступа пройдите по ссылке') + ` <a href="${config.origin}/access/${user.token}">${res.__('восстановить доступ')}.</a>`, (e, d) => {
                                if (e) {
                                    console.log(e)
                                    req.flash('error', res.__('Не удалось отправить письмо для верификации на Вашу почту.'))
                                } else {
                                    req.flash('ok', res.__('На Ваш емейл выслано письмо со ссылкой для восстановления доступа.'))
                                }
                                console.log('EMAIL INFO', d)
                                return res.render('msg/msg')
                            })
                        })
                        .catch(e => {
                            console.log(e)
                            req.flash('error', res.__('Ошибка сервера.'))
                            return res.status(500).render('msg/msg')
                        })
                }
            )
        })
        .catch(e => {
            console.log(e)
            req.flash('error', res.__('Ошибка сервера.'))
            return res.status(500).render('msg/msg')
        })
}

module.exports.accessToken = (req, res, next) => {
    if (req.user) return next()
    if (!('password' in req.body) || req.body.password.length < 6) return res.status(403).end(res.__('Не все данные заполнены.'))
    db.User.findOne({token: req.params.token})
        .then(user => {
            if (!user) return res.status(403).send(res.__('Недействительный токен.'))
            user.password = req.body.password
            user.token = ''
            user.updatedAt = Date.now()
            user
                .save()
                .then(user => {
                    req.session.user = user._id
                    res.sendStatus(200)
                })
                .catch(e => {
                    console.log(e)
                    return res.sendStatus(500)
                })
        })
        .catch(e => {
            console.log(e)
            return res.sendStatus(500)
        })
}

module.exports.profile = (req, res, next) => {
    if (!req.user) return next()
    if ('emailVerif' in req.body) {
        db.User.findOne({email: req.user.email}, (e, user) => {
            if (e) {
                console.log(e)
                req.flash('error', res.__('Ошибка сервера.'))
                return res.status(500).render('msg/msg')
            }
            if (!user) return next()
            user.updatedAt = Date.now()
            user.token = crypto
                .createHmac('sha256', Date.now().toString())
                .update(Date.now() + user.email)
                .digest('hex')
            user.save((e, user) => {
                if (e) {
                    console.log(e)
                    req.flash('error', res.__('Ошибка сервера.'))
                    return res.status(500).render('msg/msg')
                }
                if (global.config.emailSendEnable) {
                    sendMail(user.email, `${res.__('Верификация емейл адреса на сайте')} ${global.config.host}`, `${res.__('Верифицируйте свой')} <a href="${global.config.origin}/email/${user.token}" target="_blank">${res.__('емейл адрес')}</a>`, (e, d) => {
                        if (e) {
                            console.log(e)
                            req.flash('error', res.__('Не удалось отправить письмо для верификации на Вашу почту.'))
                        } else {
                            req.flash('ok', res.__('Письмо отправлено. Проверьте Вашу почту.'))
                        }
                        console.log('EMAIL INFO', d)
                        return res.render('msg/msg')
                    })
                } else {
                    req.flash('ok', res.__('Рассылка писем выключена.'))
                    return res.render('msg/msg')
                }
            })
        })
    } else if ('old_password' in req.body && 'password' in req.body) {
        db.User.findOne({email: req.user.email}, (e, user) => {
            if (e) {
                console.log(e)
                req.flash('error', res.__('Ошибка сервера.'))
                return res.status(500).render('msg/msg')
            }
            if (!user) return next()
            if (!user.checkPassword(req.body.old_password)) {
                req.flash('error', res.__('Неверный пароль.'))
                return res.status(403).render('msg/msg')
            }
            user.password = req.body.password
            user.save(e => {
                if (e) {
                    console.log(e)
                    req.flash('error', res.__('Ошибка сервера.'))
                    return res.status(500).render('msg/msg')
                }
                req.flash('ok', res.__('Пароль сменен успешно.'))
                return res.render('msg/msg')
            })
        })
    } else return next()
}

module.exports.emailToken = (req, res, next) => {
    db.User.findOne({token: req.params.token})
        .then(user => {
            if (!user) return res.status(400).send({status: 'error'})
            user.emailVerif = true
            if (user.role === 0) user.role = 1
            user.token = ''
            user.updatedAt = Date.now()
            user
                .save()
                .then(res.send({status: 'ok'}))
                .catch(res.status(500).send)
        })
        .catch(res.status(500).send)
}

module.exports.lang = (req, res, next) => {
    if (config.languages.indexOf(req.body.lang) === -1) return res.status(400).send({status: 'error'})
    res.cookie('lang', req.body.lang, {httpOnly: true})
    res.send({status: 'ok'})
}

module.exports.referrer = (req, res, next) => {
    if (!db.mongoose.Types.ObjectId.isValid(req.params.ref)) return res.redirect('/')
    db.User.findOne({_id: req.params.ref})
        .then(user => {
            if (!user) return res.redirect('/auth')
            res.cookie('p', user._id, {maxAge: config.cookieRefAge, httpOnly: true})
            res.redirect('/')
        })
        .catch(res.status(500).send)
}

//---

module.exports.authTest = (req, res, next) => {
    db.User.findOne({email: req.body.email}).then(user => {
        if (!user || !user.checkPassword(req.body.password)) return res.status(400).send({auth: res.__('Авторизация не прошла.')})
        req.session.user = user._id
        res.send({username: user.email})
    }).catch(e => {
        console.log(e)
        res.status(500).send({auth: res.__('Ошибка сервера.')})
    })
}

module.exports.isAuthTest = (req, res, next) => {
    res.send({username: req.user ? req.user.email : null})
}

module.exports.registerTest = (req, res, next) => {
    let errors = {}
    if (!/^\w+([\.\w]+)*\w@\w((\.\w)*\w+)*\.\w{2,10}$/.test(req.body.email)) errors.email = 'Email is invalid'
    if (!req.body.password || req.body.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (!req.body.password2) errors.password2 = 'Confirm Password field is required'
    if (req.body.password !== req.body.password2) errors.reg = 'Passwords must match'
    if (Object.keys(errors).length) return res.status(400).send(errors)
    db.User.findOne({email: req.body.email})
        .then(user => {
            if (user) return res.status(400).send({reg: res.__('Емейл адрес уже зарегистрирован.')})
            user = new db.User({
                email: req.body.email,
                password: req.body.password
            })
            user.token = crypto
                .createHmac('sha256', Date.now().toString())
                .update(user.email)
                .digest('hex')
            user.apiToken = crypto
                .createHmac('sha256', Date.now().toString())
                .update(Date.now() + user.email)
                .digest('hex')
            if ('ref' in req.cookies) user.ref = db.mongoose.Types.ObjectId.isValid(req.cookies.ref) ? req.cookies.ref : null
            user.save().then(user => {
                res.send({info: res.__('Регистрация прошла успешно.'), username: user.email})
            }).catch(e => {
                console.log(e)
                res.status(500).send({reg: res.__('Ошибка сервера.')})
            })
        })
        .catch(e => {
            console.log(e)
            return res.status(500).send({reg: res.__('Ошибка сервера.')})
        })
}
