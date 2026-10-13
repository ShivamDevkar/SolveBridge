# Solve Bridge

Solve Bridge is a frontend web application built with React, TypeScript, Vite, and Tailwind CSS. The project currently contains the initial application scaffold and can be extended with the course project's features.

## Tech stack

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) 4
- [ESLint](https://eslint.org/)
- npm for dependency management

## Prerequisites

Install the following before setting up the project:

- [Node.js](https://nodejs.org/) 20 or later
- npm (included with Node.js)
- Git, if you are cloning the repository

You can verify your installations with:

```bash
node --version
npm --version
```

## Installation

1. Clone the repository and move into the project directory:

   ```bash
   git clone <repository-url>
   cd solve_bridge
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

## Running the development server

Start the Vite development server with:

```bash
npm run dev
```

Vite will print the local URL in the terminal, normally:

```text
http://localhost:5173/
```

The development server supports hot module replacement, so changes to files in `src/` are reflected in the browser automatically.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Serve the production build locally |

To create and preview a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
solve_bridge/
├── public/                 # Static assets served as-is
├── src/
│   ├── App.tsx             # Root React component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind import
├── index.html              # HTML entry document
├── vite.config.ts          # Vite, React, and Tailwind configuration
├── eslint.config.js        # ESLint configuration
├── tsconfig.json           # Shared TypeScript configuration
├── tsconfig.app.json       # Application TypeScript configuration
├── tsconfig.node.json      # Node/tooling TypeScript configuration
├── package.json            # Scripts and dependencies
└── package-lock.json       # Locked dependency versions
```

## Development workflow

1. Create or switch to a feature branch.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Make changes under `src/`.
5. Run the checks before submitting changes:

   ```bash
   npm run lint
   npm run build
   ```

6. Review the generated production build with `npm run preview` when needed.

## Styling with Tailwind CSS

Tailwind CSS is enabled through the Vite plugin. Import global styles from `src/index.css` and use Tailwind utility classes directly in React components.

Example:

```tsx
export default function Example() {
  return <h1 className="text-2xl font-bold">Solve Bridge</h1>
}
```

## Environment variables

The current project does not require environment variables. If configuration is added later, define local values in a `.env.local` file and expose only client-safe variables using the `VITE_` prefix. Do not commit secrets to the repository.

## Troubleshooting

### Dependencies do not install

Confirm that Node.js and npm are installed, then retry:

```bash
npm install
```

If the lockfile has changed on another branch, pull the latest changes and run `npm install` again.

### The development server port is already in use

Start Vite on another port:

```bash
npm run dev -- --port 5174
```

### A production build is stale

Run a fresh build before previewing:

```bash
npm run build
npm run preview
```

## License

No license has been specified for this project yet.