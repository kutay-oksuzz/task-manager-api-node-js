const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

exports.sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "kutay_oksuzz@outlook.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
  });
};

exports.sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "kutay_oksuzz@outlook.com",
    subject: "We are very sorry that you deleted your account",
    text: `${name}, we are sorry. Whenever you want, you can come.`,
  });
};
