# Counter-MongoDB

计数器，基于 [Moe-Counter](https://github.com/journey-ad/Moe-Counter)

添加了调用限制

## 功能特点

- 支持自定义主题
- 使用 MongoDB 存储数据
- Redis 缓存支持
- Docker 部署支持

## 快速开始

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn
```

### 环境配置

在项目根目录创建 `.env` 文件，配置以下必要参数：

- MongoDB 数据库连接信息
- Redis 缓存配置

### 启动服务

#### 启动 MongoDB 和 Redis：

```bash
docker-compose up -d
```

#### 运行

```bash
# 使用 PM2 启动（推荐生产环境）
pm2 start ecosystem.config.js

# 或直接启动
node app.js
```

## 自定义主题

要添加新主题，只需将主题图片文件放置在 `assets/theme` 目录下即可。
