/* ==========================================================================
   Finance Forward, Editable Content
   Edit the arrays below to add or update leadership leads, collaborations,
   and Insights articles. Each section on the page renders from its array
   automatically, so you never need to touch the HTML to update content.
   ========================================================================== */

/* ---------- Site-wide contact and social links ----------
   Single source of truth, used by the nav, footer, and contact section.
   Set CONTACT_EMAIL once you have an official Finance Forward Network address. */
const CONTACT_EMAIL = ""; // e.g. "hello@financeforwardnetwork.org"
const INSTAGRAM_URL = "https://www.instagram.com/financeforwardnetwork/";
const LINKTREE_URL = "https://linktr.ee/finance.forward99";

function renderContactLinks() {
  document.querySelectorAll('[data-instagram-link]').forEach(el => el.href = INSTAGRAM_URL);
  document.querySelectorAll('[data-linktree-link]').forEach(el => el.href = LINKTREE_URL);
  document.querySelectorAll('[data-email-link]').forEach(el => {
    if (CONTACT_EMAIL) {
      el.href = `mailto:${CONTACT_EMAIL}`;
      const label = el.querySelector('[data-email-label]');
      if (label) label.textContent = CONTACT_EMAIL;
    } else {
      el.href = INSTAGRAM_URL;
      el.target = "_blank";
      el.rel = "noopener";
      const label = el.querySelector('[data-email-label]');
      if (label) label.textContent = "Message us on Instagram";
    }
  });
}

/* ---------- Leadership roles open for applications ----------
   Shown on the Join section as the strong recruitment CTA. */
const LEADERSHIP_ROLES = [
  { title: "Outreach Lead", desc: "Grow our student community and build relationships with schools, clubs, and organizations. Beyond promoting events, you'll find students who could benefit from our projects and open up new partnerships." },
  { title: "Social Media Lead", desc: "Manage and grow our presence on Instagram, TikTok, and LinkedIn. Create campaigns, announcements, and content that actually reaches students, working closely with Outreach and Design." },
  { title: "Education Lead", desc: "Make sure our projects are educational, accurate, and useful. Develop learning activities, financial literacy and cybersecurity content, and interactive experiences alongside Research and Technology." },
  { title: "Design Lead", desc: "Shape our visual identity across social graphics, campaign materials, and blog visuals. As the site and simulations grow, you'll help with UI and simulation design too." },
  { title: "Content & Research Lead", desc: "Lead our blogs, research, and written content. Cover budgeting, credit, saving, scams, and cybersecurity, and help turn research into content students actually read." },
  { title: "Technology & Innovation Lead", desc: "Help build and improve our website, AI tools, simulations, and digital tools. This is a project-building role: you'll ship things Finance Forward can actually use." }
];

/* ---------- Collaborations / Partnerships ----------
   Add one object per organization to grow this section over time.
   logo: optional path in /assets/collaborations (e.g. "assets/collaborations/org.png").
   Leave the array empty to show the "coming soon" state. */
const COLLABORATIONS = [
  // Example of how to add one once a partnership is confirmed:
  // {
  //   name: "Organization Name",
  //   description: "One sentence on what the collaboration involves.",
  //   url: "https://example.com",
  //   logo: "assets/collaborations/example.png"
  // }
];

/* ---------- Insights / Medium articles ----------
   Add one object per published article. Leave the array empty to show
   the "coming soon" state and a link to the Medium profile once it exists. */
const MEDIUM_PROFILE_URL = ""; // e.g. "https://medium.com/@financeforwardnetwork"
const INSIGHTS = [
  // Example of how to add one once an article is published:
  // {
  //   title: "Article title",
  //   excerpt: "One or two sentence summary.",
  //   url: "https://medium.com/@financeforwardnetwork/article-slug",
  //   date: "August 2026"
  // }
];

/* ---------- Render functions ---------- */

function renderRoles() {
  const wrap = document.getElementById('roles-grid');
  if (!wrap) return;
  wrap.innerHTML = LEADERSHIP_ROLES.map((r, i) => `
    <div class="role-chip reveal reveal-delay-${(i % 4) + 1}">
      <h5>${r.title}</h5>
      <p>${r.desc}</p>
    </div>
  `).join('');
}

function renderCollaborations() {
  const wrap = document.getElementById('collab-grid');
  const empty = document.getElementById('collab-empty');
  if (!wrap) return;
  if (!COLLABORATIONS.length) {
    wrap.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  wrap.style.display = 'grid';
  if (empty) empty.style.display = 'none';
  wrap.innerHTML = COLLABORATIONS.map((c, i) => `
    <div class="card collab-card reveal reveal-delay-${(i % 4) + 1}">
      <div class="collab-logo-row">
        ${c.logo
          ? `<img class="collab-logo" src="${c.logo}" alt="${c.name}">`
          : `<div class="collab-logo">${c.name.slice(0,2).toUpperCase()}</div>`
        }
        <h5 style="margin:0;">${c.name}</h5>
      </div>
      <p>${c.description}</p>
      ${c.url ? `<a class="card-link" href="${c.url}" target="_blank" rel="noopener">View partnership <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg></a>` : ''}
    </div>
  `).join('');
}

function renderInsights() {
  const wrap = document.getElementById('insights-grid');
  const empty = document.getElementById('insights-empty');
  const mediumLink = document.getElementById('medium-profile-link');
  if (mediumLink && MEDIUM_PROFILE_URL) {
    mediumLink.href = MEDIUM_PROFILE_URL;
    mediumLink.style.display = 'inline-flex';
  }
  if (!wrap) return;
  if (!INSIGHTS.length) {
    wrap.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  wrap.style.display = 'grid';
  if (empty) empty.style.display = 'none';
  wrap.innerHTML = INSIGHTS.map((post, i) => `
    <a class="card insight-card reveal reveal-delay-${(i % 4) + 1}" href="${post.url}" target="_blank" rel="noopener">
      <span class="insight-meta">${post.date}</span>
      <h4>${post.title}</h4>
      <p>${post.excerpt}</p>
      <span class="card-link">Read on Medium <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg></span>
    </a>
  `).join('');
}

// runs before js/main.js, so all dynamic cards exist in the DOM before
// main.js sets up scroll reveal and nav listeners
document.addEventListener('DOMContentLoaded', () => {
  renderContactLinks();
  renderRoles();
  renderCollaborations();
  renderInsights();
});
