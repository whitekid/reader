# GEMINI.md

## Project Overview

This project is a self-hosted read-it-later application, similar to Pocket. It's built as a Cloudflare Worker application, using Cloudflare D1 as its database. The application allows users to save URLs, which are then parsed to extract the main article content and displayed in a clean, readable format.

**Key Technologies:**

*   **Runtime:** Cloudflare Workers
*   **Database:** Cloudflare D1 (SQLite)
*   **Content Extraction:** `@mozilla/readability` and `linkedom`
*   **Deployment:** Configured for auto-deployment from GitHub to Cloudflare Workers.

**Architecture:**

The application follows a simple, routed architecture. The main `workers.ts` file acts as a router, directing incoming requests to the appropriate handler based on the URL and HTTP method. Handlers are located in the `src/handlers` directory and are responsible for processing requests, interacting with the database via `src/services/articleService.ts`, and rendering HTML templates from `src/templates`.

## Building and Running

### Prerequisites

*   Node.js and npm
*   Wrangler CLI

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Database Setup

1.  Create a D1 database:
    ```bash
    wrangler d1 create reader
    ```
2.  Update `wrangler.toml` with the `database_id` from the previous command.
3.  Initialize the database schema:
    ```bash
    npm run db:init
    ```

### Running Locally

To run the application in a local development environment:

```bash
npm run dev
```

The application will be available at `http://localhost:8787`.

### Testing

The project uses `vitest` for testing. To run the tests:

```bash
npm run test
```

### Deployment

To deploy the application to Cloudflare Workers:

```bash
npm run deploy
```

## Development Conventions

*   **Code Style:** The project uses TypeScript and is formatted according to the conventions of the existing codebase.
*   **Testing:** Tests are located in files ending with `.test.ts` and are run with `vitest`.
*   **Database Migrations:** Database schema changes are managed through SQL files in the `migrations` directory.
*   **API:** The application exposes a set of RESTful endpoints for managing articles, as detailed in the `README.md`.
