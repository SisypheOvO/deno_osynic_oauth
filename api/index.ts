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

export default function handler(req: any, res: any) {
  const webappUrl = process.env.WEBAPP_URL || "http://localhost:3000"

  res.statusCode = 200
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.end(
    pageHtml(
      "osu! OAuth Server",
      `
        <h1>osu! OAuth Server</h1>
        <p>这是一个面向 osu! 生态的 OAuth 2.0 认证服务。</p>
        <p><strong>Web 应用:</strong> <code>${webappUrl}</code></p>
        <a href="/auth">启动认证流程</a>
      `,
    ),
  )
}