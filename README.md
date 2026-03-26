# CampaignHub

CampaignHub is a marketing campaign management project with an Express API and a React + Tailwind landing page.

## Project Areas

- `server/` - Express API, PostgreSQL models, auth, contacts, and campaigns
- `client/` - Vite frontend with the CampaignHub landing page concept

## Tech Stack

- Node.js / Express.js
- PostgreSQL
- JWT Authentication
- React
- Vite
- Tailwind CSS

## Backend Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file:
```bash
PORT=5001
DATABASE_URL=postgresql:url
JWT_SECRET=secret_key
```

3. Initialize the database:
```bash
npm run db:init
```

4. Start the API:
```bash
npm run dev
```

## Frontend Setup

1. Install frontend dependencies:
```bash
cd client
npm install
```

2. Start the frontend:
```bash
npm run dev
```

The client proxies `/api` requests to `http://localhost:5001`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/contacts` - Get campaign contacts
- `POST /api/campaigns/:id/contacts` - Add contacts to campaign
- `DELETE /api/campaigns/:id/contacts/:contactId` - Remove contact
