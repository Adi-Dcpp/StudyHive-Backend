import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Study Hive",
    link: "https://studyhive.com",
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: Number(process.env.MAILTRAP_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

const sendEmail = async ({ email, subject, mailgenContent }) => {
  try {
    const emailText = mailGenerator.generatePlainText(mailgenContent);
    const emailHtml = mailGenerator.generate(mailgenContent);

    await transporter.sendMail({
      from: `"StudyHive" <${process.env.MAIL_FROM}>`,
      to: email,
      subject,
      text: emailText,
      html: emailHtml,
    });
  } catch (error) {
    throw new ApiError(500, "Email service failed");
  }
};

export default sendEmail;
