import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

webpush.setVapidDetails(
  process.env.MAIL_USER,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error("Push Notification Error:", err);
  }
};
