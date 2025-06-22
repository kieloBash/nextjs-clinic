// app/utils/email/sendEmail.ts
import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME, // your Gmail address
      pass: process.env.EMAIL_PASSWORD, // your Gmail app password
    },
  });

  const mailOptions = {
    from: `"Clinic App" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
