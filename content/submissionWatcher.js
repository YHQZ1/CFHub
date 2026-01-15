// CFHub — Submission Watcher (FINAL, STABLE)

(() => {
  console.log("[CFHub] submissionWatcher injected");

  // Guard: ensure we run once per page load
  if (window.__CFHUB_SUBMISSION_PROCESSED__) return;
  window.__CFHUB_SUBMISSION_PROCESSED__ = true;

  function extractSubmissionId() {
    // Handles: /problemset/submission/<contest>/<submission>
    const m1 = location.pathname.match(/submission\/\d+\/(\d+)/);
    if (m1) return m1[1];

    // Handles: /contest/<contest>/submission/<submission>
    const m2 = location.pathname.match(/submission\/(\d+)/);
    if (m2) return m2[1];

    return null;
  }

  function extractLanguageFromGeneralTable() {
    // Matches the HTML you pasted:
    // .datatable → table → tr.highlighted-row → td[3] = Lang
    const row = document.querySelector(".datatable table tr.highlighted-row");
    if (!row) return null;

    const cells = row.querySelectorAll("td");
    if (cells.length < 4) return null;

    return cells[3].innerText.trim(); // Lang column
  }

  function extract() {
    // Ensure Accepted
    if (!document.querySelector(".verdict-accepted")) return null;

    const submissionId = extractSubmissionId();
    if (!submissionId) return null;

    const sourcePre = document.querySelector("pre");
    if (!sourcePre) return null;

    const problemLink = document.querySelector(
      'a[href^="/problemset/problem/"]'
    );
    if (!problemLink) return null;

    const [, contestId, problemIndex] =
      problemLink.getAttribute("href").match(/problem\/(\d+)\/([A-Z0-9]+)/) ||
      [];

    const language = extractLanguageFromGeneralTable() || "unknown";

    return {
      submissionId,
      contestId,
      problemIndex,
      language,
      problemName: problemLink.innerText.trim(),
      sourceCode: sourcePre.innerText,
      url: location.href,
    };
  }

  // CF loads parts of the page async → observe until ready
  const observer = new MutationObserver(() => {
    const data = extract();
    if (!data) return;

    console.log("[CFHub] submission extracted:", data);

    chrome.runtime.sendMessage({
      type: "SUBMISSION_EXTRACTED",
      payload: data,
    });

    observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Fallback if DOM is already ready
  const immediate = extract();
  if (immediate) {
    console.log("[CFHub] submission extracted:", immediate);
    chrome.runtime.sendMessage({
      type: "SUBMISSION_EXTRACTED",
      payload: immediate,
    });
    observer.disconnect();
  }
})();
