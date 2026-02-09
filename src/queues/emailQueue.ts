import { Queue } from "bullmq";
import { redisConnection } from "../redis/connection";

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});
