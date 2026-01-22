# 阿里云 ESA 边缘函数部署指南

## 前置条件

1. 已开通阿里云 ESA（边缘安全加速）服务
2. 已添加站点并完成 DNS 配置
3. 已安装阿里云 CLI 工具

## 部署步骤

### 1. 构建前端项目

```bash
cd F:\xiangmulianxi\小红书\xhs-frontend
npm run build
```

构建完成后，静态文件会生成在 `dist` 目录。

### 2. 配置环境变量

编辑 `.env.production` 文件，设置后端 API 地址：

```
VITE_API_URL=https://your-backend-api.com
```

### 3. 上传静态资源到 ESA

#### 方式一：通过阿里云控制台

1. 登录 [阿里云 ESA 控制台](https://esa.console.aliyun.com/)
2. 选择你的站点
3. 进入「边缘函数」→「静态资源托管」
4. 上传 `dist` 目录下的所有文件

#### 方式二：通过 CLI

```bash
# 安装阿里云 CLI
pip install aliyun-cli

# 配置认证
aliyun configure

# 上传静态资源（需要根据实际 API 调整）
aliyun esa UploadStaticResource --SiteId <your-site-id> --FilePath ./dist
```

### 4. 配置边缘函数（API 代理）

如果你的后端 API 部署在其他服务器，需要配置边缘函数进行代理：

1. 进入「边缘函数」→「函数管理」
2. 创建新函数，名称：`api-proxy`
3. 将 `edge-functions/api-proxy.js` 的内容粘贴到代码编辑器
4. **修改 `BACKEND_URL` 为你的后端地址**
5. 保存并部署

### 5. 配置路由规则

1. 进入「边缘函数」→「路由规则」
2. 添加规则：
   - 匹配路径：`/api/*`
   - 执行函数：`api-proxy`

### 6. 配置 SPA 路由

为了支持前端路由（React Router），需要配置 404 回退：

1. 进入「站点配置」→「错误页面」
2. 设置 404 页面为 `/index.html`

或者在边缘函数中处理：

```javascript
// 在 api-proxy.js 中添加
if (!url.pathname.startsWith('/api') && !url.pathname.match(/\.\w+$/)) {
  // 非 API 请求且非静态资源，返回 index.html
  return fetch(new URL('/index.html', request.url));
}
```

## 后端部署建议

### 方案一：部署在阿里云 ECS

1. 在 ECS 上运行 Rust 后端服务
2. 配置安全组开放 3000 端口
3. 使用 Nginx 反向代理并配置 HTTPS
4. 将 `BACKEND_URL` 设置为 ECS 的公网地址

### 方案二：部署在阿里云函数计算 FC

1. 将 Rust 后端打包为容器镜像
2. 部署到函数计算
3. 配置 HTTP 触发器
4. 将 `BACKEND_URL` 设置为 FC 的触发器地址

### 方案三：本地开发 + 内网穿透

1. 本地运行后端服务
2. 使用 ngrok 或 frp 进行内网穿透
3. 将 `BACKEND_URL` 设置为穿透后的公网地址

## 环境变量配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| VITE_API_URL | 后端 API 地址 | https://api.example.com |

## 常见问题

### Q: 跨域问题怎么解决？

A: 边缘函数 `api-proxy.js` 已经添加了 CORS 头，如果仍有问题，检查后端是否也需要配置 CORS。

### Q: 静态资源 404？

A: 确保上传了完整的 `dist` 目录，包括 `assets` 子目录。

### Q: API 请求返回 502？

A: 检查 `BACKEND_URL` 是否正确，后端服务是否正常运行。

## 目录结构

```
xhs-frontend/
├── dist/                    # 构建输出目录
├── edge-functions/          # ESA 边缘函数
│   ├── api-proxy.js         # API 代理函数
│   └── package.json
├── src/                     # 源代码
├── .env                     # 开发环境变量
├── .env.production          # 生产环境变量
└── README.md
```
