import Auth from "../pages/services/auth.js";
import { BASE_URL } from "../config";

const ENDPOINTS = {
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  SEND_REPORT_TO_ALL_USER: () => `${BASE_URL}/stories`,
};

/**
 * Mengirim data langganan push ke server
 * @param {Object} subscription - Objek berisi endpoint dan keys
 */
export async function subscribePushNotification(subscription) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    console.error("Invalid subscription data:", subscription);
    return { ok: false, error: "Invalid subscription data" };
  }

  const { endpoint, keys: { p256dh, auth } = {} } = subscription;
  const accessToken = new Auth().getToken();
  console.log("Token digunakan:", accessToken);

  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  try {
    const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: data,
    });

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error("Subscription failed:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Menghapus langganan push dari server
 * @param {Object} subscription - Objek berisi endpoint
 */
export async function unsubscribePushNotification(subscription) {
  if (!subscription || !subscription.endpoint) {
    console.error("Invalid subscription data:", subscription);
    return { ok: false, error: "Invalid subscription data" };
  }

  const { endpoint } = subscription;
  const accessToken = new Auth().getToken();
  console.log("Token digunakan:", accessToken);

  try {
    const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ endpoint }), // Pastikan backend mendukung ini
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Unsubscribe API error:", result);
      return {
        ok: false,
        error: result.message || "Unsubscribe failed on server.",
      };
    }

    return {
      ok: true,
      ...result,
    };
  } catch (error) {
    console.error("Unsubscription failed:", error);
    return { ok: false, error: error.message };
  }
}

export async function sendReportToMeViaNotification(reportId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ME(reportId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendReportToUserViaNotification(reportId, { userId }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    userId,
  });

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_USER(reportId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendReportToAllUserViaNotification() {
  const accessToken = new Auth().getToken();
  console.log("Token digunakan:", accessToken);

  const fetchResponse = await fetch(
    ENDPOINTS.SEND_REPORT_TO_ALL_USER(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
