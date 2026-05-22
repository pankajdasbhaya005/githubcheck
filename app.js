// github API ka base URL
const API = "https://api.github.com";

// dono lists ka data yahan store hoga
// taaki search or filter kaam kar sake
let allData = {
  notFollowingBack: [],
  notFollowedBack: []
};


// enter par daba ne se bhi analyze ho jayega 
document.getElementById("usernameInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") analyze();
});



// STATUS BAR — loading ya error dikhao

function showLoading(msg) {
  const el = document.getElementById("status");
  el.className = "status-loading";
  el.innerHTML = `<div class="spinner"></div><span>${msg}</span>`;
  el.style.display = "flex";
}

function showError(msg) {
  const el = document.getElementById("status");
  el.className = "status-error";
  el.innerHTML = `<span>❌ ${msg}</span>`;
  el.style.display = "flex";
}

function hideStatus() {
  document.getElementById("status").style.display = "none";
}



// API FETCH — sare pages ek saath lao


// GitHub ek baar mein max 100 users deta hai
// isliye baar baar fetch karna padta hai jab tak sab aa jaye
async function fetchAllPages(url) {
  let allResults = [];
  let page = 1;

  while (true) {
    const res = await fetch(`${url}?per_page=100&page=${page}`);

    if (!res.ok) {
      throw new Error(`API ne error diya: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    allResults = allResults.concat(data);
    if (data.length < 100) break;
    page++;
    if (page > 10) break;
  }

  return allResults;
}



// MAIN FUNCTION — analyze button
async function analyze() {
  const username = document.getElementById("usernameInput").value.trim();

  if (!username) return;

  // pehle sab reset karo
  document.getElementById("results").style.display = "none";
  document.getElementById("analyzeBtn").disabled = true;
  document.getElementById("rateNote").style.display = "none";

  try {

    showLoading("Profile fetch ho raha hai...");
    const userRes = await fetch(`${API}/users/${encodeURIComponent(username)}`);

    if (!userRes.ok) {
      if (userRes.status === 404) throw new Error("can't find username.pls check username.");
      if (userRes.status === 403) throw new Error("github rate limit hit,please try after some minutes.");
      throw new Error(`something went wrong: ${userRes.status}`);
    }

    const user = await userRes.json();

    if (user.following > 300 || user.followers > 300) {
      document.getElementById("rateNote").style.display = "block";
    }

    showLoading(`Following fetching... (${user.following} log)`);
    const following = await fetchAllPages(`${API}/users/${encodeURIComponent(username)}/following`);

  
    showLoading(`Followers fetching... (${user.followers} log)`);
    const followers = await fetchAllPages(`${API}/users/${encodeURIComponent(username)}/followers`);

    const followingSet = new Set(following.map(u => u.login.toLowerCase()));
    const followerSet  = new Set(followers.map(u => u.login.toLowerCase()));

    
    allData.notFollowingBack = following.filter(u => !followerSet.has(u.login.toLowerCase()));

    
    allData.notFollowedBack = followers.filter(u => !followingSet.has(u.login.toLowerCase()));

    renderProfileCard(user);
    renderStats(user, following.length, followers.length);
    renderList("notFollowingBack", allData.notFollowingBack);
    renderList("notFollowedBack", allData.notFollowedBack);

    document.getElementById("notFollowingBackCount").textContent = allData.notFollowingBack.length;
    document.getElementById("notFollowedBackCount").textContent  = allData.notFollowedBack.length;

    document.getElementById("results").style.display = "block";
    hideStatus();

  } catch (err) {
    showError(err.message);
  } finally {
    document.getElementById("analyzeBtn").disabled = false;
  }
}



// RENDER FUNCTIONS — UI update karo


function renderProfileCard(user) {
  const bio = user.bio
    ? " · " + user.bio.slice(0, 60) + (user.bio.length > 60 ? "…" : "")
    : "";

  document.getElementById("profileCard").innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}" />
    <div class="profile-info">
      <h2>${user.name || user.login}</h2>
      <p>@${user.login}${bio}</p>
    </div>
    <a href="${user.html_url}" target="_blank" class="btn btn-outline">
      View on GitHub ↗
    </a>
  `;
}

function renderStats(user, followingCount, followersCount) {
  document.getElementById("statsRow").innerHTML = `
    <div class="stat-chip blue">
      <strong>${followersCount.toLocaleString()}</strong> followers
    </div>
    <div class="stat-chip green">
      <strong>${followingCount.toLocaleString()}</strong> following
    </div>
    <div class="stat-chip orange">
      <strong>${allData.notFollowingBack.length}</strong> not following back
    </div>
    <div class="stat-chip purple">
      <strong>${allData.notFollowedBack.length}</strong> you're not following back
    </div>
  `;
}

function renderList(id, users) {
  const container = document.getElementById(id);

  if (users.length === 0) {
    container.innerHTML = `<div class="empty-state">✨ Koi nahi is category mein!</div>`;
    return;
  }

  // har user ek clickable link hai — direct GitHub profile khulega
  container.innerHTML = users.map(u => `
    <a class="user-item" href="https://github.com/${u.login}" target="_blank" rel="noopener noreferrer">
      <img src="${u.avatar_url}&s=64" alt="${u.login}" loading="lazy" />
      <span class="user-name">@${u.login}</span>
      <span class="arrow-icon">↗</span>
    </a>
  `).join("");
}



// search or filter


function filterList(key, query) {
  const q = query.toLowerCase();

  const filtered = allData[key].filter(u => u.login.toLowerCase().includes(q));

  renderList(key, filtered);
}