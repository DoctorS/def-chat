const db = require('../db')

module.exports.index = (req, res, next) => {
    res.render('index', { title: res.__('Home') })
}

module.exports.auth = (req, res, next) => {
    if (req.user) return res.redirect('/profile')
    res.render('auth', { title: res.__('Авторизация') })
}

module.exports.access = (req, res, next) => {
    if (req.user) return res.redirect('/profile')
    res.render('access', { title: res.__('Восстановление доступа') })
}

module.exports.accessToken = (req, res, next) => {
    if (req.user) return res.redirect('/profile')
    res.render('accessToken', { title: res.__('Восстановление доступа') })
}

module.exports.profile = (req, res, next) => {
    if (!req.user) return res.redirect('/auth')
    db.User.count({ p: req.user._id })
        .then(countRef => {
            res.render('profile', {
                title: res.__('Профиль пользователя'),
                h1: res.__('Профиль пользователя'),
                ref: countRef
            })
        })
        .catch(res.status(500).send)
}
