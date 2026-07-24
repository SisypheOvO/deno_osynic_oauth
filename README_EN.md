# osu! OAuth Server (Deno)

English | [中文](./README.md)

A Deno-based osu! OAuth 2.0 authentication server with CORS support, environment variable configuration, and automatic token acquisition and storage.

## Quick Start

### Environment Configuration

Copy and edit the `.env` file:

```env
OSU_CLIENT_ID=your_client_id
OSU_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:4000/callback
WEBAPP_URL=http://localhost:3000
PORT=4000
```

Get credentials from [osu! OAuth Settings](https://osu.ppy.sh/home/account/edit#oauth).

### Run Server

```bash
deno run --allow-net --allow-env main.ts
# or
deno task start
```

Visit `http://localhost:4000` to start the authentication flow.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Welcome page |
| `GET /auth` | Start OAuth flow, redirect to osu! authorization page |
| `GET /callback?code=xxx&state=xxx` | Callback handler, fetch token and redirect back to webapp |

## Deployment

This project can also be deployed directly on Vercel.

1. Import this repository in Vercel
2. Set the environment variables: `OSU_CLIENT_ID`, `OSU_CLIENT_SECRET`, `REDIRECT_URI`, `WEBAPP_URL`
3. Update `REDIRECT_URI` to the `/callback` path on your Vercel domain
4. If you still keep the Deno Deploy version, you can continue using the existing `main.ts`

## Flow

User visits `/auth` → Redirected to osu.ppy.sh → Authorize and callback to `/callback` → Get token and save to localStorage → Redirect to webapp

## Important Notes

⚠️ **Important**:

- Do not commit `.env` file to Git
- Keep Client Secret confidential
- Use HTTPS in production
- Ensure Redirect URI matches exactly with osu! application settings

## License

MIT
