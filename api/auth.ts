const clientId = process.env.OSU_CLIENT_ID || "1"
const redirectUri = process.env.REDIRECT_URI || "http://localhost:4000/callback"

function handler(req: any, res: any) {
  const state = crypto.randomUUID()
  const authUrl = new URL("https://osu.ppy.sh/oauth/authorize")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", "public identify")
  authUrl.searchParams.set("state", state)

  res.statusCode = 302
  res.setHeader("Location", authUrl.toString())
  res.end()
}

module.exports = handler