console.log("Email Writer content script loaded");

/* =========================
   1. Find compose toolbar
========================= */
function findComposeToolbar() {
  const selectors = [
    ".btC",            // main compose toolbar (best)
    ".aDh",
    ".gU.Up",
    '[role="dialog"]'
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

/* =========================
   2. Get opened email text
========================= */
function getOpenedEmailText() {
  const bodies = document.querySelectorAll("div.a3s");
  let text = "";

  bodies.forEach(el => {
    text += el.innerText + "\n";
  });

  return text.trim();
}

/* =========================
   3. Get Gmail compose box
========================= */
function getComposeBox() {
  return document.querySelector('div[role="textbox"]');
}

/* =========================
   4. Call backend
========================= */
async function generateAIReply(emailText) {
  const res = await fetch("http://localhost:8080/api/email/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailContent: emailText,
      tone: "Professional"
    })
  });

  if (!res.ok) throw new Error("Backend failed");

  return await res.text();
}

/* =========================
   5. Create AI button
========================= */
function createAIButton() {
  const btn = document.createElement("div");
  btn.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button";
  btn.innerText = "AI Reply";
  btn.setAttribute("role", "button");
  btn.style.marginRight = "8px";

  btn.addEventListener("click", async () => {
    btn.innerText = "Generating...";
    btn.style.pointerEvents = "none";

    try {
      const emailText = getOpenedEmailText();
      if (!emailText) {
        alert("No email content found");
        return;
      }

      const reply = await generateAIReply(emailText);
      const composeBox = getComposeBox();

      if (!composeBox) {
        alert("Compose box not found");
        return;
      }

      composeBox.focus();
      composeBox.innerText = reply;
    } catch (e) {
      console.error(e);
      alert("Failed to generate reply");
    } finally {
      btn.innerText = "AI Reply";
      btn.style.pointerEvents = "auto";
    }
  });

  return btn;
}

/* =========================
   6. Inject button
========================= */
function injectButton() {
  if (document.querySelector(".ai-reply-button")) return;

  const toolbar = findComposeToolbar();
  if (!toolbar) return;

  toolbar.prepend(createAIButton());
  console.log("AI Reply button injected");
}

/* =========================
   7. Observe Gmail DOM
========================= */
const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      const isCompose =
        node.matches(".btC, .aDh, [role='dialog']") ||
        node.querySelector?.(".btC, .aDh, [role='dialog']");

      if (isCompose) {
        setTimeout(injectButton, 500);
        return;
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

/* =========================
   8. Keep button alive
========================= */
setInterval(() => {
  if (!document.querySelector(".ai-reply-button")) {
    injectButton();
  }
}, 2000);
