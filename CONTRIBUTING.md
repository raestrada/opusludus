# Contributing to Opus Ludus 🎼

Thank you for your interest in contributing to Opus Ludus! We welcome developers, music educators, composers, and designers to help build the ultimate gamified platform for conservatory-level classical music composition.

By contributing to this project, you agree that your contributions will be licensed under the [CC BY-NC 4.0](LICENSE) license.

---

## Language Policy

- **Repository documentation, configuration, commit messages, comments, and pull requests:** English only.
- **User-visible site UI:** Bilingual (Spanish and English). All user-visible strings are placed in `src/en/en.json`, `src/es/es.json` or within bilingual data files in `src/_data/`.
- **Primary language for interface:** Spanish (configured in `src/_data/site.json`).

---

## Local Development Setup

To run and test Opus Ludus locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raestrada/opusludus.git
   cd opusludus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development servers (parallelized):**
   ```bash
   npm run dev
   ```
   This command starts the Eleventy development server on port `8080` and starts the Webpack bundler in watch mode.

4. **Compile production build:**
   ```bash
   npm run build
   ```

---

## How to Help

### 1. Reporting Bugs
- Search existing [Issues](https://github.com/raestrada/opusludus/issues) before opening a new one.
- Provide a clear description of the bug, how to reproduce it, and the system details (OS, browser, etc.).

### 2. Suggesting Features
- Open an Issue to discuss feature requests (e.g., new music theory validations, extra gamification ranks, interactive staff features).

### 3. Submitting Pull Requests
1. Fork the repository and create your branch from `main`.
2. Ensure code conventions are followed:
   - Use ES modules (`import`/`export`) in client-side JavaScript.
   - All code logic, variable/function names, and inline documentation must be in English.
   - Run a production build (`npm run build`) and test changes locally before committing.
3. Commit message guidelines:
   - Use clean, conventional commit messages: `feat(...)`, `fix(...)`, `docs(...)`, `style(...)`, `refactor(...)`.
4. Open a Pull Request pointing to the `main` branch.
