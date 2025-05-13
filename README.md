<div align="center">
  <h1>Regex Builder</h1>
  <p>
    <strong>A powerful, open-source, drag-and-drop regex builder for the web. Build, test, and explain regular expressions visually.</strong>
  </p>
  <p>
    <a href="https://regex-builder-demo.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge" alt="Live Demo">
    </a>
  </p>
  <p>
      <img src="https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript" alt="TypeScript Ready">
      <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18">
      <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 13">
      <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css" alt="Tailwind CSS">
      <img src="https://img.shields.io/badge/pnpm-Workspace-F69220?logo=pnpm" alt="pnpm workspace">
  </p>
</div>

---

<p align="center">
  <em>Tired of wrestling with cryptic regex syntax? Regex Builder offers an intuitive, visual way to construct, understand, and validate your regular expressions. Perfect for beginners learning regex and experts looking for a quicker, more visual workflow.</em>
</p>

<p align="center">
  <a href="https://regex-builder-demo.vercel.app/" target="_blank">
    <strong>👉 Try the Live Demo 👈</strong>
  </a>
</p>

---

## ⚠️ Important Notice: Project Status

**Please Note:** This project is **not being actively maintained** due to the original author's time constraints.

*   The repository remains available for public use and forking.
*   Issues and pull requests may not receive timely responses from the original maintainer.
*   **Community contributions, forks, and independent maintenance are highly encouraged and welcome!** If you're passionate about this project and want to help, please feel free to fork it and continue its development.

---

## ✨ Features

Regex Builder is packed with features designed to make working with regular expressions a breeze:

*   🧩 **Visual Drag-and-Drop Interface:**
    *   Construct complex regex patterns by simply dragging and dropping pre-defined blocks.
    *   No need to memorize arcane syntax; build visually and intuitively.
*   🔬 **Live Regex Preview & Testing:**
    *   See your regex pattern take shape in real-time as you build.
    *   Test your expressions against sample text strings instantly.
    *   Highlights matches and capture groups directly in your test data.
*   📖 **Regex Explanation:**
    *   Get a human-readable explanation of what your constructed regex pattern does.
    *   Understand the components and logic behind your expressions, making it a great learning tool.
*   ⚙️ **Comprehensive Regex Support:**
    *   Supports all major regex features, including quantifiers, groups, lookaheads, lookbehinds, character classes, anchors, and more.
*   🧱 **Modular & Extensible Block System:**
    *   The block system is designed to be easily extended, allowing for new regex components to be added.
*   🎨 **Theme Support:**
    *   Includes built-in Light and Dark themes to suit your preference and reduce eye strain.

---

## 🚀 Getting Started

Ready to build some regex? Here's how to get Regex Builder running on your local machine:

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [pnpm](https://pnpm.io/installation) (as the project uses pnpm for package management)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/x40x1/regex-builder.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd regex-builder
    ```
3.  **Install dependencies using pnpm:**
    ```sh
    pnpm install
    ```
4.  **Run the development server:**
    ```sh
    pnpm dev
    ```
    This will typically start the application on `http://localhost:3000` (or another port if specified). Open this URL in your web browser.

---

## 🛠️ Built With

* **Frontend Framework:** React with TypeScript
* **Framework:** [Next.js](https://nextjs.org/) - React framework for production
* **UI Components:** 
  * [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind
  * [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
* **State Management:** React Context API
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Package Manager:** [pnpm](https://pnpm.io/)
* **Testing:** [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
* **Regex Engine:** JavaScript's built-in RegExp implementation

---

## 🚀 Deployment

### Building for Production

To create a production-ready build of Regex Builder:

```sh
pnpm build
```

This will generate an optimized Next.js build.

### Running Production Build Locally

To test the production build locally:

```sh
pnpm start
```

### Deployment Options

#### Option 1: Vercel (Recommended for Next.js)

The easiest way to deploy a Next.js application is with [Vercel](https://vercel.com), the platform from the creators of Next.js:

```sh
pnpm add -g vercel
vercel
```

#### Option 2: Traditional Hosting

For deploying to traditional hosting environments:

1. Build your application:
   ```sh
   pnpm build
   ```
2. Start the Next.js production server:
   ```sh
   pnpm start
   ```

#### Option 3: Static Export

If you want to export your Next.js application as static HTML:

1. Configure `next.config.js`:
   ```js
   module.exports = {
     output: 'export',
     // ...other config
   }
   ```
2. Build your application:
   ```sh
   pnpm build
   ```
   
This will export static HTML to the `out` directory, which can be deployed to any static hosting service like GitHub Pages, Netlify, or S3.

---

## 🤝 Contributing

While active maintenance by the original author is limited, contributions from the community are highly valued and welcome! If you'd like to contribute, please:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please read `CONTRIBUTING.md` for detailed guidelines on the development process, coding standards, and how to submit pull requests. Your efforts to improve and maintain Regex Builder are greatly appreciated!

Consider also checking the [open issues](https://github.com/x40x1/regex-builder/issues) for areas where you can help.

---

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

<div align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
</div>

---

<p align="center">
  Happy Regexing! ✨
</p>