const inFlight = new Set();

console.log("[CFHub][BG] service worker loaded");

chrome.runtime.onMessage.addListener((msg) => {
  // 1️⃣ From problemsetStatusWatcher → open submission page
  if (msg.type === "NEW_ACCEPTED_SUBMISSION") {
    const { submissionId, submissionUrl } = msg;

    if (inFlight.has(submissionId)) {
      console.log("[CFHub][BG] already in-flight:", submissionId);
      return;
    }

    inFlight.add(submissionId);

    console.log("[CFHub][BG] opening:", submissionUrl);
    chrome.tabs.create({ url: submissionUrl, active: false });
  }

  // 2️⃣ From submissionWatcher → receive extracted data
  if (msg.type === "SUBMISSION_EXTRACTED") {
    console.log("[CFHub][BG] submission extracted:", msg.payload);

    // later:
    // - map language → extension
    // - build repo path
    // - push to GitHub
    // - close tab
    return;
  }
});
