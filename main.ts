import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// 加载 .env 文件（如果存在）
let env: Record<string, string> = {};
try {
  env = await load();
} catch (error) {
  // 在部署环境中可能没有 .env 文件，这是正常的
  const errMsg = error instanceof Error ? error.message : String(error);
  console.error(
    "⚠️ .env file not found, proceeding with environment variables:",
    errMsg,
  );
  console.log("ℹ️ .env file not found, using environment variables instead");
}

// 配置信息
const config = {
  clientId: env.OSU_CLIENT_ID || Deno.env.get("OSU_CLIENT_ID") || "1",
  clientSecret:
    env.OSU_CLIENT_SECRET ||
    Deno.env.get("OSU_CLIENT_SECRET") ||
    "clientsecret",
  redirectUri:
    env.REDIRECT_URI ||
    Deno.env.get("REDIRECT_URI") ||
    "http://localhost:4000/callback",
  webappUrl:
    env.WEBAPP_URL || Deno.env.get("WEBAPP_URL") || "http://localhost:3000",
  port: Number.parseInt(env.PORT || Deno.env.get("PORT") || "4000"),
};

console.log("🎮 osu! OAuth Server starting...");
console.log(`🔑 Client ID: ${config.clientId}`);
console.log(`📍 Redirect URI: ${config.redirectUri}`);
console.log(`🌐 Webapp URL: ${config.webappUrl}`);
console.log(`🚀 Server port: ${config.port}`);

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // 添加 CORS 头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 处理 OPTIONS 请求（预检请求）
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 路由：根路径 - 显示使用说明
  if (path === "/") {
    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>osu! OAuth Server</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            background: #1a1a2e;
            color: #f0f0f0;
            min-height: 100vh;
            position: relative;
          }
          
          .container {
            max-width: 900px;
            margin: 40px auto;
            padding: 45px;
            background: #16213e;
            border: 1px solid rgba(255, 105, 180, 0.4);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          }
          
          .title-wrapper {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .logo-circle {
            width: 50px;
            height: 50px;
            background: #ff69b4;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            flex-shrink: 0;
            color: white;
          }
          
          h1 {
            font-size: 2.5em;
            margin: 0;
            color: #ff69b4;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          
          h1:hover {
            color: #ff1493;
          }
          
          .subtitle {
            font-size: 0.95em;
            color: #ff69b4;
            margin-bottom: 25px;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 105, 180, 0.3);
            padding-bottom: 15px;
          }
          
          p {
            line-height: 1.7;
            margin-bottom: 12px;
            color: #d0d0d0;
            font-size: 0.95em;
          }
          
          a {
            color: #ff69b4;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s;
          }
          
          a:hover {
            color: #ff1493;
            text-decoration: underline;
          }
          
          h3 {
            font-size: 1.2em;
            color: #ff69b4;
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          code {
            background: rgba(255, 105, 180, 0.1);
            color: #ff69b4;
            padding: 4px 8px;
            border: 1px solid rgba(255, 105, 180, 0.3);
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            font-weight: 600;
          }
          
          .config-box {
            background: rgba(255, 105, 180, 0.08);
            border: 1px solid rgba(255, 105, 180, 0.3);
            padding: 20px;
            margin: 20px 0;
          }
          
          .config-box p {
            margin-bottom: 8px;
          }
          
          .config-box strong {
            color: #ff69b4;
            font-weight: 700;
          }
          
          ol, ul {
            margin-left: 20px;
            margin-bottom: 15px;
          }
          
          li {
            margin-bottom: 10px;
            line-height: 1.6;
            color: #d0d0d0;
          }
          
          .btn {
            display: inline-block;
            padding: 14px 40px;
            background: #ff69b4;
            color: white;
            text-decoration: none;
            margin-top: 20px;
            font-weight: 700;
            font-size: 0.95em;
            letter-spacing: 0.5px;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-transform: uppercase;
          }
          
          .btn:hover {
            background: #ff1493;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 105, 180, 0.3);
          }
          
          .btn:active {
            transform: translateY(0);
          }
          
          .endpoint-box {
            background: rgba(255, 105, 180, 0.06);
            border: 1px solid rgba(255, 105, 180, 0.25);
            padding: 20px;
            margin: 15px 0;
          }
          
          .endpoint-item {
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 105, 180, 0.1);
            font-size: 0.95em;
          }
          
          .endpoint-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .endpoint-item code {
            background: rgba(255, 105, 180, 0.15);
            padding: 6px 10px;
            margin-right: 8px;
          }
          
          .endpoint-item span {
            color: #b0b0c0;
          }
          
          .github-link {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 100;
          }
          
          .github-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 11px 18px;
            background: #16213e;
            border: 1px solid rgba(255, 105, 180, 0.5);
            color: #ff69b4;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.85em;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .github-badge:hover {
            background: #1a2d4f;
            border-color: #ff69b4;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 105, 180, 0.2);
          }
          
          .github-icon {
            width: 20px;
            height: 20px;
            fill: currentColor;
          }
          
          @media (max-width: 768px) {
            .container {
              margin: 20px;
              padding: 25px;
            }
            
            h1 {
              font-size: 1.8em;
            }
            
            .title-wrapper {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .btn {
              width: 100%;
              text-align: center;
              padding: 12px 30px;
            }
            
            .github-link {
              top: 15px;
              right: 15px;
            }
            
            .github-badge {
              padding: 10px 15px;
              font-size: 0.8em;
            }
          }
        </style>
      </head>
      <body>
        <div class="github-link">
          <a href="https://github.com/Islatri/deno_osynic_oauth" target="_blank" rel="noopener noreferrer" class="github-badge">
            <svg class="github-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
        <div class="container">
          <a href="https://github.com/Islatri/deno_osynic_oauth" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
            <div class="title-wrapper">
              <div class="logo-circle">♪</div>
              <h1>Osynic osu!</h1>
            </div>
          </a>
          <div class="subtitle">🎵 OAuth 认证服务 | 节奏感设计</div>
          <p>为 osu! 游戏生态提供专业、安全的 OAuth 2.0 认证服务端。采用现代微服务架构，支持 CORS、环境变量配置，自动化 token 管理。</p>
          <p>Git 仓库：<a href="https://github.com/Islatri/deno_osynic_oauth" target="_blank" rel="noopener noreferrer">github.com/Islatri/deno_osynic_oauth</a></p>
          
          <div class="config-box">
            <h3>⚙️ 系统配置</h3>
            <p><strong>Client ID:</strong> <code>${config.clientId}</code></p>
            <p><strong>回调地址:</strong> <code>${config.redirectUri}</code></p>
            <p><strong>应用地址:</strong> <code>${config.webappUrl}</code></p>
          </div>

          <h3>🎮 快速开始</h3>
          <ol>
            <li><strong>启动认证</strong> - 点击下方按钮开始 OAuth 认证流程</li>
            <li><strong>授权确认</strong> - 在 osu! 官方网站登录并授权应用请求权限</li>
            <li><strong>自动返回</strong> - 系统自动交换 token 并导向你的应用</li>
          </ol>

          <button class="btn" onclick="window.location.href='/auth'">♪ 启动认证流程 ♪</button>

          <h3>🔌 API 端点</h3>
          <div class="endpoint-box">
            <div class="endpoint-item">
              <code>GET /</code>
              <span>- 欢迎页面，当前此页面</span>
            </div>
            <div class="endpoint-item">
              <code>GET /auth</code>
              <span>- 启动认证，重定向至 osu! 授权页</span>
            </div>
            <div class="endpoint-item">
              <code>GET /callback</code>
              <span>- 回调处理，自动获取 token 并重定向</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
    });
  }

  // 路由：/auth - 开始 OAuth 流程
  if (path === "/auth") {
    const state = crypto.randomUUID(); // 生成随机 state
    const authUrl = new URL("https://osu.ppy.sh/oauth/authorize");
    authUrl.searchParams.set("client_id", config.clientId);
    authUrl.searchParams.set("redirect_uri", config.redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "public identify");
    authUrl.searchParams.set("state", state);

    console.log(`🔐 Starting OAuth flow with state: ${state}`);

    return Response.redirect(authUrl.toString(), 302);
  }

  // 路由：/callback - 处理 OAuth 回调
  if (path === "/callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    console.log(
      `📨 Callback received - Code: ${code ? "✓" : "✗"}, State: ${state}`,
    );

    // 检查是否有错误
    if (error) {
      console.error(`❌ OAuth error: ${error}`);
      return new Response(`OAuth 认证失败: ${error}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 检查是否有 code
    if (!code) {
      console.error("❌ No code received");
      return new Response("缺少授权码", { status: 400, headers: corsHeaders });
    }

    try {
      // 使用 code 换取 access token
      console.log("🔄 Exchanging code for access token...");
      console.log(`📋 Client ID: ${config.clientId}`);
      console.log(`📋 Redirect URI: ${config.redirectUri}`);
      console.log(`📋 Code length: ${code.length}`);

      const requestBody = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
      });

      console.log("📤 Request body:", requestBody.toString());

      const tokenResponse = await fetch("https://osu.ppy.sh/oauth/token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`❌ Token exchange failed: ${errorText}`);
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      console.log("✅ Access token received successfully!");
      console.log(`🚀 Redirecting to webapp: ${config.webappUrl}`);

      // 使用 HTML 页面将 token 通过 URL Fragment 传递
      // Fragment 不会发送到服务器，更安全且长度限制更宽松
      const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OAuth 成功</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
              background: #1a1a2e;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              color: #f0f0f0;
            }
            
            .container {
              text-align: center;
              background: #16213e;
              padding: 50px 40px;
              border: 1px solid rgba(255, 105, 180, 0.4);
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
              max-width: 400px;
              width: 100%;
            }
            
            h1 {
              font-size: 1.8em;
              margin-bottom: 25px;
              color: #ff69b4;
              font-weight: 700;
            }
            
            .success-icon {
              font-size: 3em;
              display: block;
              margin-bottom: 20px;
              color: #ff69b4;
              animation: scaleIn 0.5s ease-out;
            }
            
            .spinner-container {
              margin: 30px 0;
            }
            
            .spinner {
              border: 3px solid rgba(255, 105, 180, 0.2);
              border-top: 3px solid #ff69b4;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            
            .status-text {
              font-size: 0.95em;
              color: #d0d0d0;
              margin-top: 25px;
            }
            
            .dots {
              display: inline-block;
              margin-left: 5px;
            }
            
            .dot {
              display: inline-block;
              width: 3px;
              height: 3px;
              background: #ff69b4;
              margin: 0 2px;
              animation: pulse 1.4s infinite;
            }
            
            .dot:nth-child(1) { animation-delay: 0s; }
            .dot:nth-child(2) { animation-delay: 0.2s; }
            .dot:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes pulse {
              0%, 60%, 100% { opacity: 0.3; }
              30% { opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="success-icon">✓</span>
            <h1>认证成功</h1>
            <div class="spinner-container">
              <div class="spinner"></div>
            </div>
            <p class="status-text">
              正在返回应用
              <span class="dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </span>
            </p>
          </div>
          <script>
            (function() {
              const tokenData = ${JSON.stringify(tokenData)};
              
              // 将 token 数据编码为 URL Fragment
              const fragment = new URLSearchParams({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expires_in.toString(),
                token_type: tokenData.token_type
              }).toString();
              
              // 重定向到 webapp，使用 # 传递 token（更安全，不会发送到服务器）
              const redirectUrl = '${config.webappUrl}#' + fragment;
              
              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 1500);
            })();
          </script>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    } catch (error) {
      console.error("❌ Error:", error);
      return new Response(
        `服务器错误: ${error instanceof Error ? error.message : "未知错误"}`,
        { status: 500, headers: corsHeaders },
      );
    }
  }

  // 404 - 未找到
  return new Response("404 - Not Found", {
    status: 404,
    headers: corsHeaders,
  });
}

console.log(`✨ Server running on http://localhost:${config.port}`);
await serve(handler, { port: config.port });
