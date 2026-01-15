# CFHub

CFHub is a lightweight Chrome extension that automatically syncs your **Accepted Codeforces submissions** to a GitHub repository.

It runs locally in your browser, requires no polling, and works by observing Codeforces pages in real time.

---

## Features

- Automatically detects **new Accepted submissions** on Codeforces
- Extracts full source code from submission pages
- Pushes solutions directly to GitHub
- Clean, deterministic repository structure
- Supports most Codeforces languages (C++, Java, Python, etc.)
- No UI, no background polling, no external servers

---

## Repository Structure

Each solution is stored using the following layout:

```text
<contestId>/<problemIndex>/solution.<ext>
```

Example:

```text
339/A/solution.java
236/A/solution.cpp
```

- Latest Accepted submission overwrites the previous one
- Git history preserves older versions if needed

---

## Installation (Manual / Local)

1. Clone this repository:

   ```bash
   git clone https://github.com/<your-username>/CFHub.git
   ```

2. Open Chrome and navigate to:

   ```text
   chrome://extensions
   ```

3. Enable **Developer Mode** (top-right)

4. Click **Load unpacked** and select the `CFHub` directory

The extension is now installed.

---

## GitHub Token Setup (Required)

CFHub uses the GitHub Contents API and requires a **Personal Access Token (PAT)**.

### Step 1: Create a GitHub PAT

1. Go to GitHub → **Settings → Developer Settings → Personal Access Tokens**
2. Generate a new token
3. Required scopes:

   - `repo` (for private repositories)
   - or `public_repo` (for public repositories)

---

### Step 2: Store the Token in the Extension

1. Open:

   ```text
   chrome://extensions
   ```

2. Find **CFHub** → click **Service Worker** → **Inspect**

3. In the DevTools console, run:

   ```js
   chrome.storage.local.set({
     githubToken: "ghp_YOUR_PERSONAL_ACCESS_TOKEN",
   });
   ```

This only needs to be done once.

---

## Usage

1. Visit the Codeforces **Status** page:

   ```text
   https://codeforces.com/problemset/status
   ```

2. Submit a solution and get an **Accepted** verdict

3. CFHub will:

   - Open the submission page in the background
   - Extract the source code
   - Push it to your GitHub repository
   - Close the submission tab automatically

No manual action required.

---

## Supported Languages

CFHub automatically maps Codeforces languages to file extensions, including:

- C / C++ → `.c`, `.cpp`
- Java → `.java`
- Python / PyPy → `.py`
- JavaScript / Node.js → `.js`
- Go → `.go`
- Rust → `.rs`
- Kotlin → `.kt`
- C# / .NET → `.cs`

Unknown languages fall back to `.txt`.

---

## Security Notes

- Your GitHub token is stored **locally** using `chrome.storage.local`
- No tokens are hardcoded or transmitted anywhere
- CFHub does not use any external servers

---

## Limitations

- Chrome only (Manifest V3)
- No UI or settings page (by design)
- One solution per problem (latest Accepted overwrites)
