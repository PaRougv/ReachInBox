import nodemailer from "nodemailer";

export async function sendMailSMTP(params: {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
}) {
  const transporter = nodemailer.createTransport({
    host: params.host,
    port: params.port,
    auth: { user: params.user, pass: params.pass }
  });

  const info = await transporter.sendMail({
    from: params.fromEmail,
    to: params.to,
    subject: params.subject,
    html: params.body
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  return { info, previewUrl };
}
