import nodemailer from "nodemailer";
import k from '../../keys';

export async function sendEmail(to: string, text: string = "U got mail!") {
    // let testAccount = await nodemailer.createTestAccount();
    // console.log('testAccount', testAccount)

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: k.emailUser,
            pass:  k.emailPass,
        },
    });

    let info = await transporter.sendMail({
        from: '"Ebuka Oj" <ebuks@ebuka.com>',
        to: to,
        subject: "Change Password",
        text: text,
        html: `<b>Hello world</b>${text}`
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}