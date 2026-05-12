# Voting Platform - Setup Guide

A professional, fully responsive paid voting platform with real-time leaderboard updates, secure payments integration, and admin dashboard.

## Features

✅ **Responsive Design** - Mobile-first design that works seamlessly across all devices
✅ **Real-time Leaderboard** - SSE (Server-Sent Events) for live vote updates
✅ **Payment Integration** - Ready for Flutterwave integration with mock support
✅ **Admin Dashboard** - Full contestant and transaction management
✅ **Secure Authentication** - NextAuth with email/password for admin access
✅ **Database** - Prisma ORM with PostgreSQL support
✅ **Transaction Management** - Idempotent payment processing with atomic votes
✅ **Rate Limiting** - Built-in protection against vote spam

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (local or remote)
- A Flutterwave account (optional - mock mode available)

## Installation

### 1. Database Setup

First, you'll need a PostgreSQL database. You have these options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL and create a database
createdb voting_platform
```

**Option B: Cloud PostgreSQL**
- Use Neon (https://neon.tech) - Free serverless PostgreSQL
- Use Railway (https://railway.app) - Simple hosting
- Use Vercel Postgres (https://vercel.com/docs/storage/postgres)

### 2. Environment Variables

Copy the `.env.local` file and update with your database connection:

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/voting_platform"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Flutterwave (add when ready)
FLUTTERWAVE_PUBLIC_KEY=""
FLUTTERWAVE_SECRET_KEY=""
```

To generate a random secret:
```bash
openssl rand -base64 32
```

### 3. Database Migration

Initialize the database schema:

```bash
# Install Prisma dependencies
pnpm install

# Run migrations
pnpm prisma migrate dev --name init

# Generate Prisma client
pnpm prisma generate
```

### 4. Initialize Database Data

Create the default settings and admin user:

```bash
pnpm prisma db seed
```

Default Admin Credentials:
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Change these credentials immediately in production!**

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Usage

### Public Voting Interface

1. Navigate to `http://localhost:3000`
2. Browse the leaderboard of contestants
3. Click "Vote Now" on any contestant
4. Enter your email and optional name
5. Complete the mock payment (in production, redirects to Flutterwave)
6. Vote is recorded when payment is verified

### Admin Dashboard

1. Navigate to `http://localhost:3000/admin/login`
2. Sign in with default credentials (admin@example.com / admin123)
3. **Dashboard**: Manage contestants (add, edit, delete)
4. **Settings**: Configure vote cost and currency
5. **Transactions**: View all payment history and vote records

## API Endpoints

### Public APIs

```
POST   /api/vote/initiate          - Initiate a vote (returns payment URL)
GET    /api/vote/verify            - Check transaction status
GET    /api/leaderboard/stream     - SSE stream for real-time updates
GET    /api/admin/contestants      - Get all contestants
```

### Admin APIs (Protected)

```
GET    /api/admin/contestants           - List all contestants
POST   /api/admin/contestants           - Create contestant
GET    /api/admin/contestants/[id]      - Get contestant details
PUT    /api/admin/contestants/[id]      - Update contestant
DELETE /api/admin/contestants/[id]      - Delete contestant

GET    /api/admin/settings              - Get voting settings
PUT    /api/admin/settings              - Update settings

GET    /api/admin/transactions          - List transactions
```

### Webhooks

```
POST   /api/webhook/flutterwave         - Flutterwave payment webhook
```

## Flutterwave Integration

### Setup

1. Create a Flutterwave account at https://dashboard.flutterwave.com
2. Get your API keys from Settings > API
3. Add to `.env.local`:

```env
FLUTTERWAVE_PUBLIC_KEY="your_public_key"
FLUTTERWAVE_SECRET_KEY="your_secret_key"
```

4. Set your webhook URL in Flutterwave dashboard:
   ```
   https://yourdomain.com/api/webhook/flutterwave
   ```

### Implementation Notes

The payment flow currently uses mock endpoints. To integrate Flutterwave:

1. Update `/app/api/vote/initiate/route.ts` to initialize real Flutterwave payments
2. Update `/app/api/webhook/flutterwave/route.ts` to verify signatures
3. The transaction model includes `flutterRef` for Flutterwave reference tracking

## Database Schema

### Tables

**Contestant**
- `id`: Unique identifier
- `name`: Contestant name
- `image`: Optional image URL
- `voteCount`: Total votes received
- `createdAt`, `updatedAt`: Timestamps

**Transaction**
- `id`: Unique identifier
- `contestantId`: Reference to contestant
- `voterEmail`: Email of voter
- `voterName`: Optional name of voter
- `amount`: Payment amount
- `currency`: Currency code (NGN, USD, etc)
- `flutterRef`: Flutterwave reference ID
- `status`: pending, completed, failed
- `voteApplied`: Whether vote was recorded
- `createdAt`, `updatedAt`: Timestamps

**Settings**
- `id`: Always "singleton"
- `voteCost`: Cost per vote
- `currency`: Currency code
- `votingActive`: Whether voting is enabled

**AdminUser**
- `id`: Unique identifier
- `email`: Admin email (unique)
- `passwordHash`: Hashed password
- `name`: Admin name
- `createdAt`, `updatedAt`: Timestamps

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

```bash
pnpm run build
pnpm start
```

### Other Platforms

1. Build the application: `pnpm run build`
2. Set all environment variables
3. Run migrations on deployment
4. Start with: `pnpm start`

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql DATABASE_URL

# Reset database (careful!)
pnpm prisma migrate reset
```

### Payment Not Processing

- Check Flutterwave API keys are correct
- Verify webhook URL is accessible
- Check transaction status in admin panel

### Admin Login Not Working

- Verify admin user exists: `pnpm prisma studio`
- Reset password by creating new admin user
- Check `NEXTAUTH_SECRET` is set

### SSE Not Updating

- Ensure browser supports EventSource API
- Check browser console for connection errors
- Verify `/api/leaderboard/stream` is accessible

## Performance Optimization

- **Leaderboard**: Indexed by vote count for fast sorting
- **Transactions**: Indexed by status and contestant for quick filtering
- **SSE**: Heartbeat every 30 seconds to keep connections alive
- **Rate Limiting**: In-memory tracking (upgrade to Redis for production)

## Security Considerations

1. **Change Default Credentials**: Update admin password immediately
2. **HTTPS Only**: Always use HTTPS in production
3. **Rate Limiting**: Upgrade to Redis for distributed deployments
4. **Webhook Verification**: Implement signature verification for Flutterwave
5. **CORS**: Configure appropriate CORS headers
6. **Input Validation**: All inputs are validated with Zod schemas
7. **SQL Injection**: Protected by Prisma ORM

## License

MIT

## Support

For issues or questions, refer to the documentation or check the implementation files.
