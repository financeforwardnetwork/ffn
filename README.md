# Finance Forward Network

Official website for Finance Forward Network, a student led organization teaching budgeting, credit, scam awareness, and cybersecurity through free simulations, workshops, and research. Founded 2025.

Pages:
- `index.html`: one-page site. Home, About, Research, Education, Simulations, Insights, Collaborations, Join Our Leadership Team, and Contact, all as sections on a single scrollable page.
- `privacy.html`: privacy policy.

No build step. Plain HTML, CSS, and JS.

## Deploy on GitHub Pages

1. Push this repo to GitHub under the Finance Forward organization.
2. Go to Settings, then Pages.
3. Under Source, select the `main` branch and `/ (root)` folder.
4. Save. The site will be live at `https://<org-name>.github.io/<repo-name>/` within a few minutes.

## Editing content

Everything that changes often lives in `js/data.js`, so you can update the site without touching HTML or CSS.

**Contact email and social links**
```js
const CONTACT_EMAIL = "";        // set once you have an official address
const INSTAGRAM_URL = "https://www.instagram.com/financeforwardnetwork/";
const LINKTREE_URL  = "https://linktr.ee/finance.forward99";
```
Until `CONTACT_EMAIL` is set, the Contact section's email card links to Instagram instead.

The site does not list individual leadership members. The Join section is built as a single strong recruitment CTA instead, backed by the roles list below.

**Leadership roles open for applications** (renders on the Join section)
```js
{ title: "Outreach Lead", desc: "A couple short sentences on what this role does." }
```

**Collaborations** (renders on the Collaborations section, shows a "coming soon" state when empty)
```js
{
  name: "Organization Name",
  description: "One sentence on the collaboration.",
  url: "https://example.com",
  logo: "assets/collaborations/example.png"   // optional
}
```

**Insights / Medium articles** (renders on the Insights section, shows a "coming soon" state when empty)
```js
const MEDIUM_PROFILE_URL = "https://medium.com/@financeforwardnetwork"; // shown once set
```
```js
{
  title: "Article title",
  excerpt: "One or two sentence summary.",
  url: "https://medium.com/@financeforwardnetwork/article-slug",
  date: "August 2026"
}
```

Add or remove objects in any of these arrays and the matching section updates automatically. No other files need to change.

## Project structure

```
finance-forward/
├── index.html
├── privacy.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js         # nav toggle, scroll reveal animation
│   └── data.js          # leadership, roles, collaborations, insights, contact links
├── assets/
│   └── brand/
│       ├── logo.jpg       # used in navbar and footer
│       └── logo-large.jpg # used in hero, upscaled for larger display
└── README.md
```

## Brand notes

- Font: Poppins throughout, used consistently for headings and body text.
- Color tokens live in `css/styles.css` under `:root`. Update the hex values there to adjust the palette site-wide.
- The logo currently on the site is 150 by 150 pixels, upscaled for the hero. Swap in a higher resolution source file at `assets/brand/logo.jpg` and `assets/brand/logo-large.jpg` when one is available, keeping the same filenames.
- Background glows use `--glow-1` and `--glow-2` and animate slowly via CSS keyframes in `.blob-field`. Motion respects `prefers-reduced-motion`.
