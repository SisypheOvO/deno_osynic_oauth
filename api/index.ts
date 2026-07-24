const config = {
  clientId: process.env.OSU_CLIENT_ID || "1",
  clientSecret: process.env.OSU_CLIENT_SECRET || "clientsecret",
  redirectUri:
    process.env.REDIRECT_URI || "http://localhost:4000/callback",
  webappUrl: process.env.WEBAPP_URL || "http://localhost:3000",
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function sendHtml(res: any, html: string, status = 200) {
  res.statusCode = status
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value)
  }
  res.end(html)
}

function sendText(res: any, text: string, status = 200) {
  res.statusCode = status
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value)
  }
  res.end(text)
}

function redirect(res: any, location: string, status = 302) {
  res.statusCode = status
  res.setHeader("Location", location)
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value)
  }
  res.end()
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
        a, button { color: #fff; background: #ff69b4; border: 0; padding: 12px 18px; text-decoration: none; display: inline-block; margin-top: 12px; cursor: pointer; }
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

export default async function handler(req: any, res: any) {
  const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`)
  const path = (url.searchParams.get("path") || "").replace(/^\/+/, "/")

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    for (const [key, value] of Object.entries(corsHeaders)) {
      res.setHeader(key, value)
    }
    res.end()
    return
  }

  if (!path || path === "/") {
    sendHtml(
      res,
      pageHtml(
        "osu! OAuth Server",
        `
          <h1>osu! OAuth Server</h1>
          <p>这是一个面向 osu! 生态的 OAuth 2.0 认证服务。</p>
          <p><strong>回调地址:</strong> <code>${config.redirectUri}</code></p>
          <p><strong>Web 应用:</strong> <code>${config.webappUrl}</code></p>
          <a href="/auth">启动认证流程</a>
        `,
      ),
    )
    return
  }

  if (path === "/auth") {
    const state = crypto.randomUUID()
    const authUrl = new URL("https://osu.ppy.sh/oauth/authorize")
    authUrl.searchParams.set("client_id", config.clientId)
    authUrl.searchParams.set("redirect_uri", config.redirectUri)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "public identify")
    authUrl.searchParams.set("state", state)

    redirect(res, authUrl.toString())
    return
  }

  if (path === "/callback") {
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    if (error) {
      sendHtml(res, pageHtml("OAuth 失败", `<h1>OAuth 认证失败</h1><p>${error}</p>`), 400)
      return
    }

    if (!code) {
      sendText(res, "缺少授权码", 400)
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
      sendHtml(
        res,
        pageHtml("OAuth 失败", `<h1>Token 交换失败</h1><p>${errorText}</p>`),
        400,
      )
      return
    }

    const tokenData = await tokenResponse.json()
    const fragment = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || "",
      expires_in: String(tokenData.expires_in),
      token_type: tokenData.token_type,
    }).toString()

    const redirectUrl = `${config.webappUrl}#${fragment}`
    sendHtml(
      res,
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
    return
  }

  sendText(res, "Not Found", 404)
}