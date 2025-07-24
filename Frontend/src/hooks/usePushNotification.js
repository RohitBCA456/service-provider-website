// hooks/usePushNotification.js
import { useEffect } from "react";

const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const usePushNotification = (providerId) => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const subscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
        });

        await fetch("https://service-provider-website.onrender.com/api/v1/providers/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ providerId, subscription }),
        });
      } catch (err) {
        console.error("Push subscription failed:", err);
      }
    };

    subscribe();
  }, [providerId]);
};

export default usePushNotification;
