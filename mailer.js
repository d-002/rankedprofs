const nodemailer = require("nodemailer");

const from = "rankedprofs@gmail.com";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: from,
        pass: "hrpn lxxh kynk smtx"
    }
});

function sendEmail(dest, subject, content, callback = () => {}) {
    const mailOptions = {
        from: from,
        to: dest,
        subject: subject,
        html: content
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error("Error sending email: "+err.response);
        else callback(info.response);
    });
};

function sendVerifEmail(dest, code, callback) {
    sendEmail(dest, "Vérification d'adresse mail", `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
#body {
    width: 100%;
    min-height: 100%;
    padding: 100px 0;

    background-color: #b4dbd0;
    color: #000;
}

#main {
    margin: 2rem 30%;
    padding: 20px;

    background-color: #f7f7f7;
    border-radius: 10px;
}

h1, p {
    text-align: center;
}

h1 {
    margin-bottom: 20px;

    font-size: 2.5rem;
    color: white;
}

p {
    font-size: 0.9rem;
}

.button {
    padding: 0.8rem;

    border-radius: 0.5rem;
    background-color: #3a88b3;
    color: white;
    text-decoration: none;
}
    </style>
  </head>

  <body><div id="body">
    <h1>Bienvenue !</h1>
    <table id="main">
      <p>Un compte <a href="https://https://rankedprofs.koyeb.app">Ranked Profs</a> vient d'être créé avec votre adresse email.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>
      <p>Pour vérifier votre adresse email, veuillez cliquer sur le lien ci-dessous :</p>
      <br />

      <tr><td align="center">
          <a href="https://rankedprofs.koyeb.app/email?code=CODE" class="button" style="margin-top: 2rem; color: #fff; text-decoration: none">Vérifier mon adresse email</a>
      </td></tr>
    </table>
  </div></body>
</html>
`.replace("CODE", code), callback);
}

module.exports = { sendEmail, sendVerifEmail };
