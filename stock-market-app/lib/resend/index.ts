import nodemailer from 'nodemailer';
import {WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE} from "@/lib/resend/templates";

export const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,            // or 587 if you prefer STARTTLS
    secure: true,         // true for 465 (implicit TLS)
    auth: {
      user: "resend",
      pass: process.env.RESEND_API_KEY!, // your Resend API key
    },
  });

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Signalist" <arthur.com>`,
        to: email,
        subject: `Welcome to Signalist - your stock market toolkit is ready!`,
        text: 'Thanks for joining Signalist',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Signalist News" <signalist@jsmastery.pro>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Signalist`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};
