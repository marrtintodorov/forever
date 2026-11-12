// FOREVER "Book a consultation" form.
// Sends each enquiry to the Supabase table "enquiries".
// The publishable key is public on purpose: the database only lets it ADD enquiries.

const SUPABASE_URL = "https://dtsqjpmwinlmtzfljufb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_un8ZXT2z-t9gHLBSqka15w_9bwWonEu";

const SUCCESS_TEXT = "Thank you, we'll be in touch within 24 hours.";
const FAILURE_TEXT = "Sorry, that didn't send. Please email us directly.";

const form = document.getElementById("enquiry-form");
const statusLine = document.getElementById("enquiry-status");
const button = form.querySelector('button[type="submit"]');
const fields = form.elements; // fields.name, fields.email, fields.message, fields.website

function showStatus(text, isOk) {
  statusLine.textContent = text;
  statusLine.className = "enquiry-status " + (isOk ? "is-ok" : "is-error");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (button.disabled) return; // already sending: ignore double clicks

  // Spam guard: robots fill in the hidden box. Pretend it worked, save nothing.
  if (fields.website.value) {
    showStatus(SUCCESS_TEXT, true);
    form.reset();
    return;
  }

  // Boxes with only spaces count as empty: clear them and let the browser say so.
  for (const box of [fields.name, fields.email, fields.message]) {
    if (!box.value.trim()) box.value = "";
  }
  if (!form.reportValidity()) return;

  button.disabled = true;
  button.textContent = "Sending...";
  statusLine.textContent = "";

  try {
    const response = await fetch(SUPABASE_URL + "/rest/v1/enquiries", {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        message: fields.message.value.trim(),
      }),
    });
    if (response.status === 201) {
      showStatus(SUCCESS_TEXT, true);
      form.reset();
    } else {
      showStatus(FAILURE_TEXT, false);
    }
  } catch (error) {
    showStatus(FAILURE_TEXT, false);
  } finally {
    button.disabled = false;
    button.textContent = "Send enquiry";
  }
});
