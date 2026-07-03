# DataWhisper Frontend

This is the frontend user interface for DataWhisper, featuring a highly-interactive, brutalist design aesthetic.

## Architecture

The frontend is built on **Next.js 16 (App Router)** and utilizes **Tailwind CSS v4** for styling.

### Diagram

```text
 _______________________________________________________________________
|                           BROWSER (Next.js)                           |
| Upload CSV   |   Ask question   |   Answer + numbers + CHART          |
|______________|__________________|_____________________________________|
               | POST /upload                 | POST /ask
               ▼                              ▼
          [ BACKEND API ]                [ BACKEND API ]
```

### Core Features
- **Brutalist Aesthetic**: Heavy use of bold borders, high contrast colors (`#B6FF3B` Neon Green and `#000000`), flat shadows, and monospace typography to give a raw, industrial feel.
- **Dynamic Charts**: Uses `recharts` to render data visualizations inline when the backend returns charting directives (e.g. `[CHART:bar|data...]`).
- **Sidebar Navigation**: Implements a ChatGPT-style sliding drawer sidebar containing recent Chat History. The dataset Schema is tucked into a floating popover accessible from the sidebar.
- **Client-Side Routing**: Completely single-page application feel with React state handling conversation chains and dataset IDs.

### Key Files
- `src/app/page.tsx`: The main chat interface, including the file upload drag-and-drop zone, chat message rendering, chart visualization, and sidebar layout.
- `src/app/layout.tsx`: Root layout, injecting the global brutalist fonts (`Inter` and `Roboto Mono`) and standard headers/footers.
- `src/app/globals.css`: Contains the Tailwind CSS configuration and base stylistic resets.

## Setup & Running Locally

### Prerequisites
- Node.js v18+
- npm (Node Package Manager)

### Installation
From this directory, run:
```bash
npm install
```

### Running the App
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: For the application to function fully, ensure the FastAPI backend is running simultaneously on port 8000.
