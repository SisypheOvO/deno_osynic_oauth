# PlantUML 架构和流程图

## C4 架构图 - System Context

```plantuml
@startuml C4_Context
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

title osu! OAuth Server - System Context

Person(user, "用户", "需要在应用中登录osu账户")
System(webapp, "Web应用", "使用OAuth进行用户认证的Web应用")
System(oauth_server, "osu! OAuth\n服务器 (Deno)", "处理OAuth认证流程")
System_Ext(osu_auth, "osu! OAuth\n授权服务", "osu官方提供的OAuth2认证服务")

Rel(user, webapp, "访问应用")
Rel(webapp, oauth_server, "发起OAuth登录")
Rel(oauth_server, osu_auth, "请求授权")
Rel(osu_auth, oauth_server, "返回授权码")
Rel(oauth_server, webapp, "重定向并传递token")
Rel(webapp, user, "登录成功")

@enduml
```

## C4 架构图 - Container

```plantuml
@startuml C4_Container
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title osu! OAuth Server - Container Diagram

Person(user, "用户", "需要认证的用户")
Container(webapp, "Web应用", "JavaScript/TypeScript", "用户访问的前端应用\n运行在localhost:3000")
Container(oauth_server, "OAuth服务器", "Deno/TypeScript", "处理OAuth流程的后端服务\n运行在localhost:4000")
System_Ext(osu_auth, "osu! OAuth服务", "提供OAuth认证的官方服务")

Rel(user, webapp, "使用浏览器访问")
Rel(webapp, oauth_server, "1. GET /auth")
Rel(oauth_server, osu_auth, "2. 重定向到授权页面")
Rel(osu_auth, user, "3. 显示授权页面")
Rel(user, osu_auth, "4. 用户授权")
Rel(osu_auth, oauth_server, "5. 回调 /callback + code")
Rel(oauth_server, osu_auth, "6. 使用code获取token")
Rel(osu_auth, oauth_server, "7. 返回access_token")
Rel(oauth_server, webapp, "8. 重定向回webapp + token")
Rel(webapp, user, "9. 登录成功")

@enduml
```

## UML 序列图 - OAuth流程

```plantuml
@startuml oauth_sequence
title osu! OAuth 2.0 认证流程

participant User as "用户\n(浏览器)"
participant Webapp as "Web应用\n(localhost:3000)"
participant OAuthServer as "OAuth服务器\n(localhost:4000)"
participant OsuAuth as "osu! OAuth服务\n(osu.ppy.sh)"

User->>Webapp: 1. 点击登录按钮
activate Webapp
Webapp->>OAuthServer: 2. GET /auth
activate OAuthServer
OAuthServer->>OsuAuth: 3. 重定向到OAuth授权页面
deactivate OAuthServer
OAuthServer-->>Webapp: 重定向响应
deactivate Webapp
Webapp-->>User: 重定向
activate OsuAuth
User->>OsuAuth: 4. 访问授权页面
OsuAuth->>User: 5. 显示授权确认页面
User->>OsuAuth: 6. 点击授权
OsuAuth->>OAuthServer: 7. GET /callback?code=xxx&state=xxx
activate OAuthServer
OAuthServer->>OsuAuth: 8. POST /oauth/token\n(使用code + client_secret)
activate OsuAuth
OsuAuth-->>OAuthServer: 9. 返回access_token
deactivate OsuAuth
deactivate OsuAuth
OAuthServer->>Webapp: 10. 重定向回webapp\nURL中包含token
deactivate OAuthServer
Webapp-->>User: 11. 重定向
User->>Webapp: 12. 访问redirectURI\n获取token
activate Webapp
Webapp->>Webapp: 13. 保存token到localStorage
Webapp->>User: 14. 显示登录成功页面
deactivate Webapp

@enduml
```

## UML 类图 - 服务结构

```plantuml
@startuml class_diagram
title osu! OAuth Server - 服务结构

class OAuthServer {
  - config: Config
  - corsHeaders: Headers
  --
  + handler(req: Request): Promise<Response>
  + handleRoot(): Response
  + handleAuth(redirectUri: string): Response
  + handleCallback(code: string, state: string): Promise<Response>
  + exchangeToken(code: string): Promise<TokenResponse>
}

class Config {
  + clientId: string
  + clientSecret: string
  + redirectUri: string
  + webappUrl: string
  + port: number
}

class TokenResponse {
  + access_token: string
  + token_type: string
  + expires_in: number
  + refresh_token: string
  + scope: string
}

class CallbackData {
  + code: string
  + state: string
}

OAuthServer *-- Config
OAuthServer *-- TokenResponse
OAuthServer *-- CallbackData

@enduml
```

## UML 状态图 - 用户认证状态

```plantuml
@startuml state_diagram
title 用户认证流程状态机

[*] --> 未认证
未认证 --> 等待授权: 用户点击登录
等待授权 --> 获取授权码: 用户在osu!授权
获取授权码 --> 交换Token: 接收授权码
交换Token --> 已认证: Token获取成功
交换Token --> 错误: Token获取失败
错误 --> 未认证: 重新开始
已认证 --> 未认证: 用户登出

@enduml
```

## 组件交互图

```plantuml
@startuml component_diagram
title osu! OAuth Server - 组件交互图

package "前端应用" {
  component [UI组件] as UI
  component [OAuth流程处理] as OAuthHandler
  component [LocalStorage] as Storage
}

package "OAuth服务器" {
  component [HTTP处理器] as HTTPHandler
  component [路由器] as Router
  component [认证逻辑] as AuthLogic
  component [环境配置] as ConfigLoader
}

package "外部服务" {
  component [osu! OAuth API] as OsuAPI
}

UI --> OAuthHandler: 触发登录
OAuthHandler --> HTTPHandler: 发送HTTP请求
HTTPHandler --> Router: 路由请求
Router --> AuthLogic: 处理认证
AuthLogic --> ConfigLoader: 获取配置
AuthLogic --> OsuAPI: 调用OAuth接口
OsuAPI --> AuthLogic: 返回token
AuthLogic --> Router: 返回结果
Router --> HTTPHandler: 生成响应
HTTPHandler --> OAuthHandler: 返回response
OAuthHandler --> Storage: 存储token
Storage --> UI: 更新UI状态

@enduml
```

## API端点流图

```plantuml
@startuml api_flow
title osu! OAuth Server - API端点流程

start
:用户请求;
if (请求路径?) then (GET /)
  :200 欢迎页面;
  stop
elseif (OPTIONS) then
  :200 CORS预检;
  stop
elseif (GET /auth) then
  :302 重定向到osu! OAuth;
  stop
elseif (GET /callback) then
  if (是否有code参数?) then (是)
    :POST请求获取token;
    if (token获取成功?) then (是)
      :302 重定向回webapp;
      stop
    else (否)
      :500 服务器错误;
      stop
    endif
  else (否)
    :400 缺少code参数;
    stop
  endif
else (其他)
  :404 页面不存在;
  stop
endif

@enduml
```

## 部署架构

```plantuml
@startuml deployment
title osu! OAuth Server - 部署架构

node "本地开发环境" {
  component [用户浏览器\nlocalhost:3000] as LocalBrowser
  component [Deno OAuth服务器\nlocalhost:4000] as LocalServer
}

node "生产环境 (Deno Deploy)" {
  component [用户浏览器] as ProdBrowser
  component [OAuth服务器<br/>(deno.dev)] as ProdServer
}

cloud "osu! 官方服务" {
  component [OAuth认证<br/>osu.ppy.sh] as OsuService
}

LocalBrowser -.-> LocalServer: HTTP/HTTPS
LocalServer -.-> OsuService: OAuth流程
ProdBrowser -.-> ProdServer: HTTPS
ProdServer -.-> OsuService: OAuth流程

@enduml
```

## 技术栈图

```plantuml
@startuml tech_stack
title osu! OAuth Server - 技术栈

package "运行时" {
  [Deno]
}

package "依赖库" {
  [std/http/server]
  [std/dotenv]
}

package "协议" {
  [HTTP/1.1]
  [OAuth 2.0]
}

package "环境变量" {
  [OSU_CLIENT_ID]
  [OSU_CLIENT_SECRET]
  [REDIRECT_URI]
  [WEBAPP_URL]
  [PORT]
}

[Deno] --> [std/http/server]
[Deno] --> [std/dotenv]
[std/http/server] --> [HTTP/1.1]
[HTTP/1.1] --> [OAuth 2.0]
[std/dotenv] --> [环境变量]

@enduml
```
