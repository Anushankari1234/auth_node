import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection } from "../redis/connection";
import { sendWelcomeEmail } from "../shared/utils/sendgrid";

new Worker(
  "email-queue",
  async job => {
    const { email } = job.data;

    console.log(`Sending email to ${email}`);
    await sendWelcomeEmail(email);
    console.log(`Email sent to ${email}`);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);
