# Supabase Setup

## Quick Setup (CLI)

```bash
# Push schema to remote database
supabase db push
```

## Alternative (Dashboard)

1. Go to your Supabase project dashboard
2. Open the **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run**

## Tables Created

### `fighters`
Stores fighter profiles and stats.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | Text | Fighter name (unique) |
| `win_count` | Integer | Total wins |
| `stats` | JSONB | Fighter stats (striking, wrestling, etc.) |
| `metadata` | JSONB | Extra data (totalFights, losses, etc.) |
| `created_at` | Timestamp | When created |

### `fights`
Stores fight history.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent1_id` | UUID | First fighter |
| `agent2_id` | UUID | Second fighter |
| `winner_id` | UUID | Winner (null = draw) |
| `method` | Text | KO, TKO, SUB, DEC, DQ, NC |
| `round` | Integer | Round ended (1-5) |
| `fight_data` | JSONB | Full fight log/details |
| `created_at` | Timestamp | When fight happened |

## RLS Policies

- **Read**: Public (anyone can view fighters/fights)
- **Write**: Service role only (API uses `SUPABASE_SERVICE_ROLE_KEY`)

This means the web UI and CLI can read data freely, but only your Vercel API can create/update records.
