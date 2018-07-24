const db = require("../db");

module.exports = (req, res, next) => {
  res.locals.url = req.url;

  req.user = res.locals.user = null;

  if ("p" in req.query && db.mongoose.Types.ObjectId.isValid(req.query.p)) {
    db.User.findById(req.query.p)
      .then(user => {
        if (user) res.cookie("p", user._id, { maxAge: global.config.cookieRefAge, httpOnly: true });
        return null;
      })
      .catch(e => {
        console.log(e);
      });
  }

  if (!req.session.user) return next();

  db.User.findById(req.session.user)
    .select("email")
    .then(user => {
      req.user = res.locals.user = user;
      user.info = {
        ip: req.headers["x-real-ip"] || null,
        country: req.headers["x-country"] || null,
        region: req.headers["x-region"] || null,
        city: req.headers["x-city"] || null,
        lat: req.headers["x-lat"] || null,
        long: req.headers["x-long"] || null,
        dt: new Date(),
        userAgent: req.headers["user-agent"] || null
      };
      user
        .save()
        .then(r => null)
        .catch(e => console.log(e));
      return next();
    })
    .catch(e => {
      console.log(e);
      next(e);
    });
};
