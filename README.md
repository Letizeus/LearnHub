[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://repostatus.org/#wip)   
# LearnHub

A web platform for uploading learning content with:

- **Project**: [Nx](https://nx.dev/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Frontend:** Angular
- **Backend:** NestJS
- **Admin Panel:** Angular
- **Database:** MongoDB (via Docker Compose)

---

## Table of Contents

- [LearnHub](#learnhub)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Start MongoDB](#start-mongodb)
  - [Project Structure](#project-structure)
  - [Environment variables](#environment-variables)
  - [Development](#development)
    - [Run all](#run-all)
    - [Run individually](#run-individually)
  - [Database (MongoDB)](#database-mongodb)
  - [Scripts](#scripts)
  - [Disclaimer](#disclaimer)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker](https://www.docker.com/)

### Installation

```bash
pnpm install
```

### Start MongoDB

```bash
docker-compose up -d
```

---

## Project Structure

```
.
├── apps/
│   ├── frontend/    # Angular frontend
│   ├── backend/     # NestJS backend
│   └── admin/       # Angular admin panel
├── libs/            # Shared libraries
├── docker-compose.yml
├── nx.json
├── package.json
└── README.md
```

---

## Environment variables

Make sure to set the .env before running:

```env
MONGO_PORT= // Changes the mongo port if you run multiples
```

---

## Development

### Run all

```bash
pnpm dev
```

### Run individually

```bash
pnpm dev:<PROJECT>
```

Following urls are defined by default:

- frontend: http://localhost:4200
- backend: http://localhost:3000/api
- admin: http://localhost:4201

---

## Database (MongoDB)

MongoDB is managed via Docker Compose.
This will automatically create `mongo-express` which serves as a web interface for the database.

You can access the webinterface at:

```bash
http://localhost:8081
```

---

## Scripts

- `pnpm nx serve <app>`: Serve an app (frontend, backend, admin)
- `pnpm nx build <app>`: Build an app
- `pnpm nx test <app>`: Run tests for an app
- `docker-compose up -d`: Start MongoDB

---

## Disclaimer

This project is created regarding the "Einführung in die Webtechnologien"-Module of RWTH Aachen University. It serves as bonus project.
