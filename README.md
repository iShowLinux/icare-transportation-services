# iCare Transportation Services — Website

A static website for iCare Transportation Services, a veteran-owned non-emergency medical transportation (NEMT) company based in South Carolina.

---

## Explain It Like I'm 5

Think of this website like a **house made of LEGO bricks**.

- The **HTML files** are the rooms — they decide what goes on each page (words, buttons, sections).
- The **CSS files** are the paint, furniture, and decorations — they decide what everything *looks* like (colors, sizes, spacing).
- The **JavaScript files** are the electricity — they make things *do stuff* (open the menu, validate the form, scroll back to the top).
- The **assets folder** is the storage closet — it holds images, fonts, and icons.

You don't need a server, a database, or a framework. Open an HTML file in a browser and it just works.

---

## Folder Structure

```
iCare Transportation Services/
│
├── public/                  ← The actual web pages (HTML)
│   ├── index.html           Home page
│   ├── about.html           About Us
│   ├── services.html        Our Services
│   ├── rates.html           Rates & Pricing
│   ├── contact.html         Contact / Book a Ride form
│   └── faq.html             Frequently Asked Questions
│
├── css/                     ← All styling lives here
│   ├── variables.css        The "settings file" — brand colors, fonts, spacing
│   ├── main.css             Global styles that apply to every page
│   ├── components/          Reusable building blocks
│   │   ├── buttons.css      Button styles (orange, navy, outline, etc.)
│   │   ├── header.css       Top navigation bar
│   │   ├── footer.css       Bottom footer
│   │   ├── hero.css         Big banner sections at the top of pages
│   │   ├── cards.css        Service cards, why-iCare cards, etc.
│   │   └── forms.css        Contact form inputs, labels, error states
│   └── pages/               Styles specific to ONE page only
│       ├── home.css         Appointment tags, hours grid
│       ├── about.css        Story layout, veteran callout, values grid
│       ├── services.css     Service detail sections, appointment matrix
│       ├── rates.css        Rate cards, policy blocks
│       ├── contact.css      Form layout, sidebar info cards
│       └── faq.css          Accordion questions, category filter
│
├── js/                      ← All interactivity lives here
│   ├── main.js              Runs on every page (scroll-to-top, sticky header, animations)
│   ├── components/
│   │   ├── navbar.js        Opens/closes the mobile hamburger menu
│   │   └── forms.js         Shared form validation logic (checks required fields, email, phone)
│   └── pages/
│       └── contact.js       Contact form submission + FAQ accordion + category filter
│
├── assets/                  ← Static files (add real images here)
│   ├── images/
│   │   ├── hero/            Large background/banner images
│   │   ├── vehicles/        Photos of the fleet
│   │   ├── team/            Driver/staff headshots
│   │   └── icons/           Custom icon graphics (if not using Font Awesome)
│   ├── fonts/               Custom font files (if self-hosting instead of Google Fonts)
│   └── favicon/             The little icon in the browser tab
│
└── docs/
    ├── brand-guide.md       Colors, fonts, tone of voice reference
    └── design-notes.md      Decisions log and client feedback
```

---

## How the CSS System Works

### Step 1 — Variables (the settings file)

`css/variables.css` is the most important CSS file. It defines the entire brand as reusable **tokens**:

```css
--clr-primary:  #163960;   /* Navy blue  — used for the header, headings */
--clr-accent:   #E8751A;   /* Orange     — used for CTA buttons */
--clr-teal:     #0F8EA3;   /* Teal       — used for icons, medical feel */
```

**Rule:** If a color, font, or spacing value needs to change, change it **only here**. It updates everywhere automatically. Never hardcode a color like `#163960` directly in a page CSS file.

### Step 2 — main.css (the glue)

`main.css` uses `@import` to pull in all the component files in the right order, then adds global rules (typography scale, the `.container` width, section padding, the CTA banner, utility classes like `.text-center`).

Every HTML page only needs **two CSS links**:

```html
<link rel="stylesheet" href="../css/main.css">      <!-- everything global -->
<link rel="stylesheet" href="../css/pages/home.css"> <!-- only this page's extras -->
```

### Step 3 — Components vs. Pages

| Folder | Rule |
|---|---|
| `css/components/` | Styles a **reusable piece** that appears on more than one page (buttons, nav, cards). Never put page-specific styles here. |
| `css/pages/` | Styles that only make sense on **one specific page**. If you find yourself writing the same rule in two page files, move it to a component. |

---

## How the HTML Pages Work

Every page follows the exact same skeleton:

```html
<head>
  <!-- 1. Meta tags (SEO description, title) -->
  <!-- 2. Google Fonts -->
  <!-- 3. Font Awesome icons (CDN) -->
  <!-- 4. CSS links -->
</head>

<body>
  <header>  <!-- sticky nav — same on every page -->
  <main>    <!-- unique content for this page -->
  <footer>  <!-- same on every page -->

  <script type="module" src="../js/main.js">  <!-- always loaded -->
  <!-- contact.html and faq.html also load ../js/pages/contact.js -->
</body>
```

### Active nav link

Each page manually marks its own nav link as `active`:

```html
<!-- on about.html -->
<a href="about.html" class="nav-link active">About Us</a>
```

This is the simple, no-framework way to highlight the current page in the nav.

### Links between pages

All pages live in the same `/public/` folder, so links are just filenames:

```html
<a href="services.html">Services</a>   ✅ correct
<a href="/services">Services</a>       ❌ won't work as a static file
```

---

## How the JavaScript Works

The JS uses **ES Modules** (`type="module"`), which means:

- Files can `import` from each other — no global variable soup
- The browser handles dependency order automatically
- **This requires a server to work** — `file://` in Chrome will block modules (see "Running Locally" below)

### main.js (runs on every page)

```
1. Imports navbar.js   → sets up hamburger menu
2. Creates scroll-to-top button and appends it to the page
3. Adds "scrolled" class to header when user scrolls (triggers shadow)
4. Highlights the correct nav link based on the current filename
5. Sets up IntersectionObserver to fade cards in as they scroll into view
```

### navbar.js

Handles the mobile hamburger menu:
- Click hamburger → adds `.open` class to nav and hamburger
- Click outside or press ESC → closes it
- Locks body scroll while menu is open so the page doesn't scroll behind it

### forms.js (shared utility)

Exports two helper functions used by `contact.js`:

| Function | What it does |
|---|---|
| `validateField(input)` | Checks if a field is empty, if an email looks valid, if a phone has the right format. Returns `true` (valid) or `false` (invalid). |
| `setupLiveValidation(form)` | Wires up `blur` and `input` events so errors appear as the user fills in the form, not only on submit. |

### contact.js (contact page + FAQ)

**Form submission:**
1. On submit, runs `validateField` on every input
2. If anything fails, stops and shows the errors
3. If all valid, POSTs the form data to the Formspree endpoint
4. On success: hides the form, shows the green success card
5. On failure: re-enables the button and shows an alert

**FAQ accordion:**
- Click a `.faq-question` → toggles `.open` on its parent `.faq-item`
- CSS handles the animation (`max-height` transition)
- Only one item can be open at a time

**FAQ category filter:**
- Click a `.faq-cat-btn` → shows only `.faq-item` elements with the matching `data-cat` attribute
- `data-cat="all"` shows everything

---

## Running Locally

### Option A — Just open the file (CSS only, no JS modules)

Double-click `public/index.html`. The page will look correct but the hamburger menu and form validation won't work in Chrome/Edge because they block ES Modules on `file://`.

### Option B — Local server (fully functional, recommended)

You need Node.js installed. Then in your terminal:

```bash
npx serve "path/to/iCare Transportation Services/public"
```

Open `http://localhost:3000` in your browser. Everything works.

Or with Python (no install needed on Mac/Linux):

```bash
cd "path/to/iCare Transportation Services/public"
python -m http.server 3000
```

---

## Deploying the Site

This is a plain static site — no build step, no npm install, no compilation. Upload the contents of the `/public` folder plus `/css`, `/js`, and `/assets` folders to any host.

### Recommended hosts (all free tiers available)

| Host | How to deploy |
|---|---|
| **Netlify** | Drag and drop the whole project folder onto netlify.com/drop |
| **GitHub Pages** | Push to a GitHub repo, enable Pages in Settings |
| **Vercel** | Connect GitHub repo, it auto-deploys on every push |

**Important:** When deploying, the root of your deployment should be the **project root** (not `/public`), so that relative paths like `../css/main.css` from inside `/public/` resolve correctly.

---

## Making Common Changes

### Change a brand color

Open `css/variables.css` and update the token:

```css
--clr-accent: #E8751A;  /* change this hex value */
```

Every button, label, and highlight using that color updates automatically.

### Add a new page

1. Copy any existing HTML file in `/public/` (e.g. `about.html`)
2. Rename it (e.g. `team.html`)
3. Update the `<title>` and meta description
4. Change the `active` class on the nav link to point to `team.html`
5. Replace the content inside `<main>`
6. Create `css/pages/team.css` if the page needs unique styles
7. Add `<link rel="stylesheet" href="../css/pages/team.css">` in the `<head>`
8. Add a nav link to `team.html` in the `<ul class="nav-list">` on **every page**

### Add a real photo

Drop the image file into the appropriate subfolder under `assets/images/`, then reference it in HTML:

```html
<img src="../assets/images/vehicles/van-01.jpg" alt="iCare accessible transport van">
```

Always include a descriptive `alt` attribute — it's required for accessibility and SEO.

### Wire up the contact form

In `public/contact.html`, find this line in the `<form>` tag:

```html
action="https://formspree.io/f/YOUR_FORM_ID"
```

Replace `YOUR_FORM_ID` with your actual Formspree form ID. Create a free account at [formspree.io](https://formspree.io), create a new form, and paste the ID. Form submissions will be emailed to whatever address you configure there.

---

## Tech Stack

| Technology | Version | Why |
|---|---|---|
| HTML5 | — | Structure and content |
| CSS3 (Custom Properties) | — | Styling with a token-based design system |
| Vanilla JavaScript (ES Modules) | ES2020 | Interactivity, no framework overhead |
| Font Awesome | 6.5 | Icons via CDN |
| Google Fonts | — | Poppins + Inter via CDN |
| Formspree | — | Contact form backend (no server needed) |

No npm. No build tools. No framework. A browser is all you need to run it.

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). IE11 is not supported — CSS custom properties and ES Modules are not available in IE11.

---

*Built for iCare Transportation Services — South Carolina's trusted veteran-owned NEMT provider.*
