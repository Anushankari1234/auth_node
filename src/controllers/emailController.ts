import { Request, Response } from "express";
import { sendEmail } from "../services/emailService";
import {sendMailWithSendGrid} from "../services/sendGridService";

export async function sendTestEmail(req: Request, res: Response) {
  const { email } = req.body;

  await sendEmail(
    email,
    "Welcome!",
    "Welcome to our app ",
    "<h1>Welcome!</h1><p>You are successfully registered.</p>"
  );

  res.json({ message: "Email sent successfully" });
}


export const sendViaSendGrid = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  await sendMailWithSendGrid(
    email,
    "SendGrid Test",
    "Hello from SendGrid"
  );

  res.json({ message: "Email sent via SendGrid" });
};