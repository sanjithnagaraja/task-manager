# Task Manager-

A full-stack task manager with a REST API and a responsive dashboard. Create, edit, delete, filter and sort tasks by status and due date.

## Tech stack-

| Layer | Technologies |
| ----- | ------------ |
| API   | NestJS, TypeScript, Prisma 6, SQLite, class-validator, class-transformer, Jest |
| Web   | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, lucide-react, react-hook-form, zod, sonner |

## Project structure-

```text
task-manager/
├── api/                      # NestJS + Prisma + SQLite (port 3001)
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── tasks/            # Controller, service, module, DTOs, tests
│   │   ├── prisma/           # PrismaService + module
│   │   ├── app.module.ts
│   │   └── main.ts           # CORS + global ValidationPipe
│   ├── .env.example
│   └── package.json
├── web/                      # Next.js App Router + shadcn/ui (port 3000)
│   ├── src/
│   │   ├── app/              # layout, page, globals.css
│   │   ├── components/       # ui/ (shadcn) + task-table, task-dialog, delete-alert, ...
│   │   ├── hooks/            # use-tasks
│   │   ├── lib/              # api.ts (typed fetch client), format.ts
│   │   └── types/            # task.ts
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites-

- Node.js v20+ (LTS)
- npm (bundled with Node.js)


## Setup from a fresh clone

### 1. API (`/api`)

```bash
cd api
npm install
npx prisma migrate dev --name init
npm run start:dev
```

The API runs at http://localhost:3001. `npm install` also generates the Prisma client, and `prisma migrate dev` creates the SQLite database at `api/prisma/dev.db`. Commit the generated `api/prisma/migrations/` folder so a fresh clone can simply run `npx prisma migrate dev`.

| Variable       | Default                 | Description              |
| -------------- | ----------------------- | ------------------------ |
| `DATABASE_URL` | `file:./dev.db`         | SQLite connection string |
| `PORT`         | `3001`                  | API port                 |
| `FRONTEND_URL` | `http://localhost:3000` | Origin allowed by CORS   |

### 2. Web (`/web`)

Open a second terminal:

```bash
cd web
npm install

# One-time: generate the shadcn/ui components into src/components/ui
npx shadcn@latest init -d
npx shadcn@latest add --yes button table badge dialog alert-dialog select input textarea label skeleton alert sonner tabs

npm run dev
```

The app runs at http://localhost:3000. Commit the generated `src/components/ui/`, `components.json` and `src/lib/utils.ts`; after that, the shadcn commands are not needed again on a fresh clone.

| Variable              | Default                 | Description  |
| --------------------- | ----------------------- | ------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | API base URL |


## API reference-

| Method | Endpoint     | Description                                 | Success | Errors   |
| ------ | ------------ | ------------------------------------------- | ------- | -------- |
| GET    | `/tasks`     | List tasks (supports filtering and sorting) | 200     | 400      |
| GET    | `/tasks/:id` | Get a single task                           | 200     | 404      |
| POST   | `/tasks`     | Create a task                               | 201     | 400      |
| PATCH  | `/tasks/:id` | Partially update a task                     | 200     | 400, 404 |
| DELETE | `/tasks/:id` | Delete a task                               | 204     | 404      |

**Query parameters for `GET /tasks`**

| Param    | Values                        | Notes                                                  |
| -------- | ----------------------------- | ------------------------------------------------------ |
| `status` | `TODO`, `IN_PROGRESS`, `DONE` | Filter by status                                       |
| `sortBy` | `dueDate`, `createdAt`        | Default is `createdAt` (newest first)                  |
| `order`  | `asc`, `desc`                 | Default is `asc` for `dueDate`, `desc` for `createdAt` |

When sorting by `dueDate`, tasks without a due date are always listed last.

**Task fields**

| Field         | Type                          | Notes                                      |
| ------------- | ----------------------------- | ------------------------------------------ |
| `id`          | string (UUID)                 | Generated                                  |
| `title`       | string                        | Required, max 200 characters               |
| `description` | string or null                | Optional, max 2000 characters              |
| `status`      | `TODO`, `IN_PROGRESS`, `DONE` | Defaults to `TODO`                         |
| `dueDate`     | ISO 8601 string or null       | Optional. Send `null` on PATCH to clear it |
| `createdAt`   | ISO 8601 string               | Generated                                  |

Invalid input (missing title, invalid status, bad date, unknown fields) returns `400 Bad Request`.

## Tests and verification-

```bash
cd api
npm run build   # type-check
npm test        # unit tests (service logic + DTO validation, no database needed)
```

Manual API check with curl:-

```bash
curl -s -X POST localhost:3001/tasks -H 'Content-Type: application/json' \
  -d '{"title":"Write README","status":"IN_PROGRESS","dueDate":"2026-12-01"}'
curl -s "localhost:3001/tasks?status=IN_PROGRESS&sortBy=dueDate&order=asc"
curl -s -i localhost:3001/tasks/does-not-exist   # 404
curl -s -X POST localhost:3001/tasks -H 'Content-Type: application/json' \
  -d '{"title":"x","status":"BLOCKED"}'          # 400
```

Frontend:

```bash
cd web
npm run lint
npm run build
```

## Design decisions-

- **Status as a string.** SQLite has no native enums, so `status` is a string column validated in the API with a TypeScript `TaskStatus` enum and `@IsEnum`.
- **Strict validation.** A global `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted` and `transform`, so unknown fields are rejected with a 400.
- **DELETE returns 204.** The typed client handles the empty body.
- **Due dates as UTC dates.** The UI formats them in UTC so date-only values don't shift by timezone.
- **Backend filtering and sorting.** The UI delegates both to the API through query params.



## How I used AI-

- **Planning:** Used an AI assistant to break the project into phases (API, tests, client, UI, docs) so each phase could be built, tested and committed on its own.
- **Scaffolding and boilerplate:** Generated the initial NestJS/Prisma setup, DTOs and shadcn/ui components, then reviewed every file before committing.
- **Verification:** Ran the unit tests and manual curl checks myself, and fixed issues that came up.
- **Decisions I made myself:** Pinning Prisma v6 for smooth SQLite configuration, handling clean status badges (TODO, IN_PROGRESS, DONE) on the frontend, and structuring the DTO validation pipes globally in main.ts.
- **What I changed or rejected:** Refined the frontend error handling and fallback UI states to ensure clean user feedback, and stripped out unnecessary boilerplate to keep the codebase lightweight.
- **Limits:** AI output was treated as a draft. I checked behavior against the requirements rather than trusting it blindly.
