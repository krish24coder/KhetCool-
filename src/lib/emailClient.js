import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// Sends a "new booking" notification email via EmailJS.
// The actual "To" address is set inside the EmailJS template itself
// (see README → Email setup), not here — this just fills the template
// variables. Fails silently (logs a warning) if not configured, so a
// booking never breaks just because email isn't set up yet.
export async function sendBookingEmail({ bookingCode, unitId, village, district, crop, qty, days, cost }) {
  if (!isEmailConfigured) return false;
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        booking_code: bookingCode,
        unit_id: unitId,
        village,
        district,
        crop,
        qty_tonnes: qty,
        days,
        cost_inr: cost,
        booked_at: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      },
      { publicKey: PUBLIC_KEY }
    );
    return true;
  } catch (err) {
    console.warn("EmailJS send failed:", err?.text || err?.message || err);
    return false;
  }
}
