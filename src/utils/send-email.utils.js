import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { ApiError } from "./api-error.utils.js";
import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Study Hive",
    link: "https://studyhive-web.vercel.app/",
  },
});

const transporter = !isProd
  ? nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    })
  : null;

const sendEmail = async ({ email, subject, mailgenContent }) => {
  try {
    const emailHtml = mailGenerator.generate(mailgenContent);

    if (!isProd) {
      // Development → Mailtrap SMTP
      await transporter.sendMail({
        from: `"StudyHive" <${process.env.MAILTRAP_USER}>`,
        to: email,
        subject,
        html: emailHtml,
      });
    } else {
      // Production → Brevo HTTP API
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "StudyHive",
            email: process.env.MAIL_FROM,
          },
          to: [{ email }],
          subject,
          htmlContent: emailHtml,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Email Error:", error.response?.data || error.message);
    throw new ApiError(500, "Email service failed");
  }
};

export default sendEmail;