import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendWelcomeEmail(email: string) {
  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!, 
    subject: "Welcome ",
    text: `Hi ${email}, welcome to our platform!`,
    html: `<h2>Hi ${email} </h2><p>Welcome to our platform!</p>`,
  });
}
