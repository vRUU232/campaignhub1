# CampaignHub

Marketing Campaign Management System API

## Tech Stack

- Node.js / Express.js
- PostgreSQL
- JWT Authentication
- bcrypt Password Hashing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Contacts (Protected)
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Campaigns (Protected)
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/contacts` - Get campaign contacts
- `POST /api/campaigns/:id/contacts` - Add contacts to campaign
- `DELETE /api/campaigns/:id/contacts/:contactId` - Remove contact

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file:
```
PORT=5001
DATABASE_URL=postgresql:url
JWT_SECRET=secret_key
```

3. Initialize database:
```bash
npm run db:init
```

4. Start server:
```bash
npm run dev
```

## Project Structure

```
server/
├── config/        (Database configuration)
├── controllers/   (Business logic)
├── middleware/    (JWT authentication)
├── models/        (Database operations)
├── routes/        (API endpoints)
└── index.js       (Entry point)
```
