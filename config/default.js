let settings = {
  host: "domain-name.com",
  origin: "https://domain-name.com",
  sendingEmails: true,
  siteEmail: "info@domain-name.com",
  adminEmailService: "yandex",
  adminEmailUser: "info@domain-name.com",
  adminEmailPass: "",
  emailsFrom: "Site Name <info@domain-name.com>",
  emailSendEnable: true,
  cookieSecret: "E9Zb18goBC0dibhmQbPZVIb5",
  cookieRefAge: 60 * 60 * 24 * 30,
  reCaptchaPub: "###",
  reCaptchaPriv: "###",
  dbName: "test-db",
  dbPort: 27017,
  payPalKey: "###",
  defaultLang: "ru",
  languages: ["en", "ru"],
  control: {},
  security: {}
};

module.exports = settings;
