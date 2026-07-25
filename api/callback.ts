const config = {
  clientId: process.env.OSU_CLIENT_ID || "1",
  clientSecret: process.env.OSU_CLIENT_SECRET || "clientsecret",
  redirectUri:
    process.env.REDIRECT_URI || "http://localhost:4000/callback",
  webappUrl: process.env.WEBAPP_URL || "http://localhost:3000",
}

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

function pageHtml(title: string, body: string) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101827; color: #f3f4f6; }
        .card { width: min(720px, calc(100vw - 32px)); background: #16213e; border: 1px solid rgba(255, 105, 180, 0.35); padding: 32px; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35); }
        h1 { margin: 0 0 16px; color: #ff69b4; }
        p, li { line-height: 1.7; color: #d1d5db; }
        code { background: rgba(255, 105, 180, 0.12); padding: 2px 6px; border: 1px solid rgba(255, 105, 180, 0.22); }
      </style>
    </head>
    <body>
      <div class="card">
        ${body}
      </div>
    </body>
    </html>
  `
}

async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
      res.statusCode = 204
      res.end()
      return
    }

    if (error) {
      res.statusCode = 400
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.end(pageHtml("OAuth 失败", `<h1>OAuth 认证失败</h1><p>${error}</p>`))
      return
    }

    if (!code) {
      res.statusCode = 400
      res.setHeader("Content-Type", "text/plain; charset=utf-8")
      res.end("缺少授权码")
      return
    }

    const requestBody = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    })

    const tokenResponse = await fetch("https://osu.ppy.sh/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      res.statusCode = 400
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.end(
        pageHtml("OAuth 失败", `<h1>Token 交换失败</h1><p>${errorText}</p>`),
      )
      return
    }

    const tokenData = (await tokenResponse.json()) as TokenResponse
    const fragment = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || "",
      expires_in: String(tokenData.expires_in),
      token_type: tokenData.token_type,
    }).toString()

    const redirectUrl = `${config.webappUrl}#${fragment}`
    res.statusCode = 200
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.end(
      pageHtml(
        "OAuth 成功",
        `
          <h1>OAuth 成功</h1>
          <p>正在返回到你的应用。</p>
          <script>
            const redirectUrl = ${JSON.stringify(redirectUrl)}
            setTimeout(() => { window.location.href = redirectUrl }, 100)
          </script>
        `,
      ),
    )
  } catch (error) {
    console.error("OAuth callback failed:", error)
    res.statusCode = 500
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.end(
      pageHtml(
        "OAuth 失败",
        `<h1>回调处理失败</h1><p>${error instanceof Error ? error.message : String(error)}</p>`,
      ),
    )
  }
}

module.exports = handler