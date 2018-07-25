const express = require("express"),
  router = express.Router(),
  page = require("./page"),
  user = require("./user");

// pages
// router.get('/', page.index)
// auth
// router.get('/auth', page.auth)
// router.post('/register', user.register)
// router.post('/auth', user.auth)
// router.post('/logout', user.logout)
// // profile
// router.get('/profile', page.profile)
// router.post('/profile', user.profile)
// // access
// router.get('/email/:token', user.emailToken)
// router.get('/access', page.access)
// router.post('/access', user.access)
// router.get('/access/:token', page.accessToken)
// router.post('/access/:token', user.accessToken)
// // referrer
// router.get('/p/:ref', user.referrer)
// // settings
// router.post('/lang', user.lang)

router.post("/register-test", user.registerTest);
router.post("/auth-test", user.authTest);
router.post("/is-auth", user.isAuthTest);
router.post("/logout", user.logout);

module.exports = router;
