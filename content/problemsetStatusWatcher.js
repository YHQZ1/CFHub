// CFHub — Problemset Status Watcher (persistent)

(() => {
  console.log("[CFHub] watcher loaded");

  let lastSeenSubmissionId = null;
  const seenThisSession = new Set();

  function loadMarker() {
    return new Promise((resolve) => {
      chrome.storage.local.get("lastSeenSubmissionId", (data) => {
        resolve(data.lastSeenSubmissionId || null);
      });
    });
  }

  function saveMarker(id) {
    chrome.storage.local.set({ lastSeenSubmissionId: id });
  }

  async function scan() {
    const rows = document.querySelectorAll(
      "table.status-frame-datatable tr[data-submission-id]"
    );
    if (!rows.length) return;

    // Load marker once
    if (lastSeenSubmissionId === null) {
      lastSeenSubmissionId = await loadMarker();

      // First ever run
      if (!lastSeenSubmissionId) {
        lastSeenSubmissionId = rows[0].getAttribute("data-submission-id");
        saveMarker(lastSeenSubmissionId);
        console.log("[CFHub] initialized marker:", lastSeenSubmissionId);
        return;
      }
    }

    for (const row of rows) {
      const submissionId = row.getAttribute("data-submission-id");
      if (!submissionId) continue;
      if (seenThisSession.has(submissionId)) continue;
      if (Number(submissionId) <= Number(lastSeenSubmissionId)) continue;
      if (!row.querySelector(".verdict-accepted")) continue;

      seenThisSession.add(submissionId);

      const link = row.querySelector("a.view-source");
      if (!link) return;

      const submissionUrl = link.href;

      chrome.runtime.sendMessage({
        type: "NEW_ACCEPTED_SUBMISSION",
        submissionId,
        submissionUrl,
      });

      lastSeenSubmissionId = submissionId;
      saveMarker(submissionId);

      console.log("[CFHub] detected NEW Accepted:", submissionId);
    }
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });

  scan();
})();
