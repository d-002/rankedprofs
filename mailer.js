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
        console.log("sent");
    });
};

function sendVerifEmail(dest, code, callback) {
    sendEmail(dest, "Vérification d'adresse mail", `
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="format-detection" content="telephone=no">
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
        </style>
    </head>

<body>
    <table cellspacing="0" cellpadding="0" border="0" align="center">
        <tbody>
            <tr>
                <td>
                    <p style="margin: 50px 0; font-size: 24px; font-weight: bold;">Bienvenue sur Ranked Profs !</p>
                </td>
            </tr>
            <tr>
                <p>Un compte <a href="https://https://rankedprofs.koyeb.app">Ranked Profs</a> vient d'être créé avec votre adresse email.</p>
                <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>
                 <p>Pour vérifier votre adresse email, veuillez cliquer sur le lien ci-dessous :</p>
            </tr>
            <tr>
                <!--[if mso]>
                    <v:roundrect  xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="padding: 5px; border-radius: 10px; border: 2px solid #73bb73; background-color: #fff; color: #165118; font-weight: bold; text-align: center; width=200px; height: 16px" align="center">
                        <w:anchorlock/>
                        <v:textbox>
                            <a href="https://rankedprofs.koyeb.app/email?code=CODE" style="color: #fff; text-decoration: none; font-size: 16px">Vérifier mon adresse email</a>
                        </v:textbox>
                    </v:roundrect>
                <![endif]--><![if !mso]>
                    <td style="padding: 5px; border-radius: 10px; border: 2px solid #73bb73; background-color: #fff; color: #165118; font-weight: bold; text-align: center" width="200" align="center">
                        <a href="https://rankedprofs.koyeb.app/email?code=CODE" class="button" style="margin-top: 2rem; color: #fff; text-decoration: none">Vérifier mon adresse email</a>
                    </td>
                <![endif]>
            </tr>

            <tr>
                <td>
                    <table>
                        <tbody>
                            <tr style="padding: 30px; padding-top: 10px; background-color: #eee; border: none">
                                <td>
                                    <p>Ranked profs</p>
                                </td>
                                <td>
                                    <a href="mailto:rankedprofs@gmail.com">Contact</a>
                                </td>
                                <td>
                                    <a href="https://rankedprofs.koyeb.app">Termes et conditions</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
    </body>
</html>
`.replace("CODE", code), callback);
}

module.exports = { sendEmail, sendVerifEmail };
