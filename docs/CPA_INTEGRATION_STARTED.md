# CPA Network Integration Started 🚀

## What's Been Created

### 1. AdGate Media Integration
- ✅ Created AdGate API client (`lib/cpa/adgate.ts`)
- ✅ Created CPA networks database functions (`lib/db/cpa-networks.ts`)
- ✅ Created sync API route (`/api/admin/sync-tasks`)
- ✅ Task syncing function ready

### 2. Database Functions
- ✅ `getAllNetworks()` - Get all CPA networks
- ✅ `getNetworkById()` - Get network by ID
- ✅ `getNetworkByName()` - Get network by name
- ✅ `createNetwork()` - Create new network
- ✅ `updateNetwork()` - Update network settings
- ✅ `deleteNetwork()` - Delete network

### 3. Task Syncing
- ✅ `fetchAdGateOffers()` - Fetch offers from AdGate API
- ✅ `syncAdGateOffersToTasks()` - Sync offers to tasks table
- ✅ Automatic task creation/updates
- ✅ Profit margin calculation (80% to user, 20% to you)

## What You Need to Do

### 1. Check AdGate Media API Documentation

The integration is a **template** - you need to:

1. **Get actual API documentation** from AdGate Media dashboard
2. **Update the API endpoint URL** in `lib/cpa/adgate.ts`
3. **Update authentication method** (might not be Bearer token)
4. **Update response format** (transform function needs actual structure)

### 2. Update `lib/cpa/adgate.ts`

Key things to update:

```typescript
// 1. Update base URL
const ADGATE_BASE_URL = "https://api.adgatemedia.com" // Get actual URL from docs

// 2. Update authentication
headers: {
  "Authorization": `Bearer ${ADGATE_API_KEY}`, // Check their auth method
  // OR might be:
  // "X-API-Key": ADGATE_API_KEY,
  // "X-API-Secret": ADGATE_API_SECRET,
}

// 3. Update response transformation
// The transformAdGateOffers() function needs to match their actual response
```

### 3. Test the Integration

1. **Create network in database:**
   ```sql
   INSERT INTO cpa_networks (name, api_key, api_secret, country_filter, is_active)
   VALUES ('AdGate Media', '08d76ea7-e607-49ff-8927-fbd34338a843', 'qFM7grnZ4cR3UrhJwowPmBQ5DzNEtCbE', 'IN', TRUE);
   ```

2. **Call sync endpoint** (as admin):
   ```bash
   POST /api/admin/sync-tasks
   ```

3. **Check tasks table** - Should see synced tasks

## API Route

**POST `/api/admin/sync-tasks`**
- Requires admin authentication
- Syncs all AdGate offers to tasks
- Returns count of synced tasks

## Environment Variables

Already configured in `.env.local`:
```env
ADGATE_API_KEY=08d76ea7-e607-49ff-8927-fbd34338a843
ADGATE_API_SECRET=qFM7grnZ4cR3UrhJwowPmBQ5DzNEtCbE
```

## Next Steps

1. **Get AdGate API docs** from their dashboard
2. **Update the integration** with actual API details
3. **Test sync functionality**
4. **Set up webhook/callback** for conversion tracking
5. **Add more networks** (CPAGrip, Torox, etc.) using same pattern

## Profit Margin

Currently set to:
- **80% to user** (user_payout = network_payout * 0.8)
- **20% to you** (profit margin)

You can adjust this in `syncAdGateOffersToTasks()` function.

## Callback/Webhook Setup

For conversion tracking, you'll need to:
1. Create webhook endpoint: `/api/cpa/adgate/callback`
2. Verify callback signature (if AdGate provides one)
3. Update task completion status based on callback

This is not yet implemented - add it when you have AdGate's callback documentation.
