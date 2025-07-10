# Product Export Client

A lightweight React + TypeScript + Vite application that fetches product data from a backend API and displays it in an interactive table. Users can search, sort, and export the results as CSV.

## Prerequisites

- **Node.js** (v22.11.0 or higher recommended)  
- **npm** (bundled with Node.js)

## Installation

1. Clone this repository  
   ```bash
   git clone https://github.com/your-org/oo2csv-client.git
   cd oo2csv-client
````

2. Install dependencies

   ```bash
   npm install
   ```

## Development

Start the development server with hot-reload:

```bash
npm run dev
```

Once it’s running, open your browser at [http://localhost:5173](http://localhost:5173).

To build a production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Features

* **Data fetching** from `http://localhost:3001/api/produkte`
* **Search** box to filter products by name
* **Sortable** table columns (click header to toggle)
* **CSV export** of the current view
* Built on **React**, **TypeScript**, and **Vite**

## Project Structure

```
/
├── public/              
│   └── vite.svg         # Vite logo asset  
├── src/
│   ├── assets/          # static images & styles  
│   ├── components/      # reusable UI components  
│   │   └── Produktsuche.tsx  
│   ├── pages/           # top-level page components  
│   │   └── Products.tsx  
│   ├── App.tsx          # main layout & logic  
│   ├── App.css          # base styles  
│   ├── main.tsx         # entry point  
│   └── vite-env.d.ts    # Vite TypeScript declarations  
├── index.html           # HTML template  
├── tsconfig.json        # TypeScript configuration  
├── vite.config.ts       # Vite configuration  
├── package.json         # project metadata & scripts  
└── README.md            # this file  
```

## npm Scripts

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start Vite development server (hot-reload) |
| `npm run build`   | Build production bundle                    |
| `npm run preview` | Preview production build locally           |
| `npm run lint`    | Run ESLint over the codebase               |

## Dependencies

* **react** `^19.1.0`
* **react-dom** `^19.1.0`
* **react-router-dom** `^7.6.3`
* **react-tooltip** `^5.28.1`
* **lucide-react** `^0.511.0`

## Dev Dependencies

* **vite** `^6.3.5`
* **typescript** `~5.8.3`
* **@vitejs/plugin-react** `^4.4.1`
* **eslint** `^9.25.0`
* **@eslint/js** `^9.25.0`
* **eslint-plugin-react-hooks** `^5.2.0`
* **eslint-plugin-react-refresh** `^0.4.19`
* **@types/react** `^19.1.2`
* **@types/react-dom** `^19.1.2`
* **globals** `^16.0.0`

## Future Improvements

* Improve error handling and loading states
* Extract more reusable components
* Make the API URL configurable via environment variables
* Add unit and integration tests

---

```
```
