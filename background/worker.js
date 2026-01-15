const inFlight = new Set();

const GITHUB_OWNER = "YOUR_USERNAME";
const GITHUB_REPO = "CodeForces";
const GITHUB_BRANCH = "main";

function getFileExtension(language) {
  if (!language || typeof language !== "string") return "txt";

  const lang = language.toLowerCase();

  if (lang.includes("c++") || lang.includes("g++") || lang.includes("clang++"))
    return "cpp";
  if (lang === "c" || lang.includes("gcc c")) return "c";

  if (lang.includes("python") || lang.includes("pypy")) return "py";
  if (lang.includes("java")) return "java";
  if (lang.includes("kotlin")) return "kt";

  if (lang.includes("c#") || lang.includes(".net")) return "cs";

  if (lang.includes("javascript") || lang.includes("node.js")) return "js";
  if (lang === "go" || lang.includes("go ")) return "go";
  if (lang.includes("rust")) return "rs";

  if (lang.includes("php")) return "php";
  if (lang.includes("ruby")) return "rb";
  if (lang.includes("swift")) return "swift";
  if (lang.includes("scala")) return "scala";
  if (lang.includes("haskell")) return "hs";
  if (lang.includes("ocaml")) return "ml";
  if (lang.includes("pascal")) return "pas";
  if (lang.startsWith("dmd") || lang === "d") return "d";
  if (lang.includes("f#")) return "fs";
  if (lang.includes("perl")) return "pl";

  return "txt";
}

function getGithubToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get("githubToken", (res) => {
      resolve(res.githubToken || null);
    });
  });
}

async function pushToGitHub({ path, content, message }) {
  const token = await getGithubToken();
  if (!token) throw new Error("GitHub token not set");

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  let sha = null;

  const existing = await fetch(apiUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (existing.status === 200) {
    const json = await existing.json();
    sha = json.sha;
  }

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "NEW_ACCEPTED_SUBMISSION") {
    const { submissionId, submissionUrl } = msg;

    if (inFlight.has(submissionId)) return;

    inFlight.add(submissionId);
    chrome.tabs.create({ url: submissionUrl, active: false });
    return;
  }

  if (msg.type === "SUBMISSION_EXTRACTED") {
    const { submissionId, contestId, problemIndex, language, sourceCode } =
      msg.payload;

    const tabId = sender.tab?.id;
    const ext = getFileExtension(language);
    const repoPath = `${contestId}/${problemIndex}/solution.${ext}`;

    (async () => {
      try {
        await pushToGitHub({
          path: repoPath,
          content: sourceCode,
          message: `CF ${contestId}${problemIndex} solution`,
        });

        if (tabId) chrome.tabs.remove(tabId);
      } finally {
        inFlight.delete(submissionId);
      }
    })();

    return true;
  }
});
