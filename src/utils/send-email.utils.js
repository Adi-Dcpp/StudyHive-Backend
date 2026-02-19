import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { ApiError } from "./api-error.utils.js";

const isProd = process.env.NODE_ENV === "production";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Study Hive",
    link: "https://studyhive.com",
  },
});

const transporter = nodemailer.createTransport(
  isProd
    ? {
        host: process.env.PROD_MAIL_HOST,
        port: Number(process.env.PROD_MAIL_PORT),
        secure: true, // Gmail with port 465
        auth: {
          user: process.env.PROD_MAIL_USER,
          pass: process.env.PROD_MAIL_PASS,
        },
      }
    : {
        host: process.env.MAILTRAP_HOST,
        port: Number(process.env.MAILTRAP_PORT),
        secure: false,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      },
);

const sendEmail = async ({ email, subject, mailgenContent }) => {
  try {
    const emailHtml = mailGenerator.generate(mailgenContent);

    await transporter.sendMail({
      from: `"StudyHive" <${isProd ? process.env.PROD_MAIL_USER : process.env.MAILTRAP_USER}>`,
      to: email,
      subject,
      html: emailHtml,
    });
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Email service failed");
  }
};

export default sendEmail;
