# GitHub Follower Analyzer

A simple tool where you enter any GitHub username and instantly see:

- **Who you follow but they don't follow you back**
- **Who follows you but you don't follow them back**

---

## Features

- Uses GitHub's public API — no login required
- Handles up to 1000 followers/following
- Click on any username to open their GitHub profile directly
- Search/filter available in both lists
- Fully responsive — works on mobile too

---

## How to Use

1. Open the website
2. Enter a GitHub username
3. Click the **Analyze** button
4. Done — both lists will appear instantly

---

## Tech Stack

| File | Purpose |
|---|---|
| `index.html` | Structure and layout |
| `style.css` | Design and styling |
| `app.js` | Logic and GitHub API calls |

---

## Limitations

> GitHub's public API allows only **60 requests per hour** without login.
> If the account is very large (500+ follows), the rate limit may be hit.

---

## Live Demo

🔗-https://githubcheck-five.vercel.app/

---

## Author

Built with ❤️ by **Pankaj**