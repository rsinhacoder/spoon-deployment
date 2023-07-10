import nodemailer from "nodemailer";
import config from "../config.js";

export const mailer = (emailId, link) => {
  nodemailer
    .createTransport({
      service: "gmail",
      auth: {
        user: `${config.sendMailId}`,
        pass: `${config.sendMailPassword}`,
      },
      port: 465,
      host: "smtp.gmail.com",
    })
    .sendMail(
      {
        from: `"Spoon-project" <${config.sendMailId}>`,
        to: `${emailId}`,
        subject: "reset-password",
        text: `reset-link`,
        html: `<div style="padding:10px 20px;">
        <h2>Reset link is only valid for 5 minutes.</h2>
        <a href="${link}" style="padding:10px 20px; border-radius:20px; color:white; background: linear-gradient(#F26522, #FF0661); border:none; box-shadow: 0px 7px 20px gray">Reset Your Password</a>
        </div>`,
      },
      (error) => {
        return error;
      }
    );
};
