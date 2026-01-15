(() => {
  if (window.__CFHUB_SUBMISSION_PROCESSED__) return;
  window.__CFHUB_SUBMISSION_PROCESSED__ = true;

  function extractSubmissionId() {
    const m1 = location.pathname.match(/submission\/\d+\/(\d+)/);
    if (m1) return m1[1];

    const m2 = location.pathname.match(/submission\/(\d+)/);
    if (m2) return m2[1];

    return null;
  }

  function extractLanguage() {
    const row = document.querySelector(".datatable table tr.highlighted-row");
    if (!row) return null;

    const cells = row.querySelectorAll("td");
    if (cells.length < 4) return null;

    return cells[3].innerText.trim();
  }

  function extract() {
    if (!document.querySelector(".verdict-accepted")) return null;

    const submissionId = extractSubmissionId();
    if (!submissionId) return null;

    const sourcePre = document.querySelector("pre");
    if (!sourcePre) return null;

    const problemLink = document.querySelector(
      'a[href^="/problemset/problem/"]'
    );
    if (!problemLink) return null;

    const match = problemLink
      .getAttribute("href")
      .match(/problem\/(\d+)\/([A-Z0-9]+)/);

    if (!match) return null;

    const [, contestId, problemIndex] = match;

    return {
      submissionId,
      contestId,
      problemIndex,
      language: extractLanguage() || "unknown",
      sourceCode: sourcePre.innerText,
    };
  }

  const observer = new MutationObserver(() => {
    const data = extract();
    if (!data) return;

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

  const immediate = extract();
  if (immediate) {
    chrome.runtime.sendMessage({
      type: "SUBMISSION_EXTRACTED",
      payload: immediate,
    });
    observer.disconnect();
  }
})();
