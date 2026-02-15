# ⚡ @alyvro/api-service

[![Socket Badge](https://badge.socket.dev/npm/package/@alyvro/api-service/1.0.3)](https://socket.dev/npm/package/@alyvro/api-service/overview)
![CI](https://github.com/Alyvro/api-service/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/@alyvro/api-service)

**A minimal yet powerful service for sending HTTP requests on the client and handling them gracefully on the server. No complicated setup. Just plug in your keys — and you're ready to go.**

### 🚀 Features

- ✅ **Universal Support** — Works seamlessly on both Client and Server
- ✅ **Modular Middleware** — Dedicated imports for Fastify & Express (Tree-shakable)
- ✅ **Typed Axios** — Full TypeScript inference for your API endpoints
- ✅ **Built-in Plugins** — Cache, Retry, Compressor, and Cancellation
- ✅ **Auto Error Reporting** — Send server errors directly to Telegram
- ✅ **Zero Config Start** — Works out of the box with minimal setup

---

### 📦 Installation

bash
pnpm add @alyvro/api-service

# or

npm install @alyvro/api-service

If you are using a specific framework, make sure it is installed (e.g., `fastify` or `express`).

---

## ✨ Server-Side Usage

Initialize the service once in your application entry point.

### ➤ Fastify

Import the middleware directly from the fastify subpath. This ensures no Express dependencies are loaded.

```ts
import Fastify from "fastify";
import { ApiService } from "@alyvro/api-service";
import middleware from "@alyvro/api-service/fastify";

const fastify = Fastify();

new ApiService({
  url: "http://localhost:3000",
  setting: { telegram: true }, // Optional: Enable Telegram error logs
  middleware: {
    skip_routers: ["/health"],
  },
});

// Add the hook to handle API security and logging
fastify.addHook("preHandler", middleware);

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.listen({ port: 3000 });
```

### ➤ Express

```ts
import express from "express";
import { ApiService } from "@alyvro/api-service";
import middleware from "@alyvro/api-service/express";

const app = express();

new ApiService({
  url: "http://localhost:3000",
});

app.use(middleware);

app.get("/", (req, res) => {
  res.json({ message: "Hello from Express" });
});
```

---

## ✨ Client-Side Usage

You can use either the supercharged Axios client or the native Fetch wrapper.

### ➤ Using Axios (Recommended)

```ts
import { ApiService } from "@alyvro/api-service";

const api = new ApiService({
  url: "https://api.alyvro.com",
});

const response = await api.client.axios.request().post(
  "/user",
  { name: "John Doe" },
  {
    plugins: {
      retry: { retries: 3 },
      compressor: true,
    },
  },
);
```

### ➤ Using Fetch

```ts
const response = await api.client.fetch.request("/user", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## 💎 Typed API (TypeScript Magic)

Define your API schema once and get full auto-completion and type inference for every request.

```ts
import { ApiService } from "@alyvro/api-service";

type ApiSchema = {
  "/users": {
    GET: {
      response: { id: number; name: string }[];
      params: { page: number; index: number };
    };
  };
  "/auth/login": {
    POST: {
      body: { username: string };
      response: { token: string };
    };
  };
};

const api = new ApiService({
  url: "https://api.example.com",
}).client.axios.request<ApiSchema>();

// ✅ TypeScript knows this returns { token: string }
api.post("/auth/login", { username: "admin" }).then((res) => {
  console.log(res.data.token);
});

// ✅ TypeScript knows this returns Array<{ id: number; name: string }>
api.get("/users", { params: { page: 1 } }).then((res) => {
  console.log(res.data[0].name);
});
```

---

## 🧩 Plugins (Axios Only)

Plugins allow extending the functionality of requests per call.

| Plugin         | Description                                                  |
| :------------- | :----------------------------------------------------------- |
| **Retry**      | Automatically retries failed requests with backoff strategy. |
| **Cache**      | Stores responses to prevent redundant network calls.         |
| **Compressor** | Handles gzip compression/decompression automatically.        |
| **Cancel**     | specific signal to abort requests.                           |

**Example:**

```ts
import { createAbortController } from "@alyvro/api-service/plugins";

const controller = createAbortController();

api.client.axios.request().get("/large-data", {
  signal: controller.signal,
  plugins: {
    retry: { retries: 5, retryDelay: 1000 },
    cache: true,
  },
});

// Cancel the request
controller.abort();
```

---

## ⚙️ Configuration

| Key                       | Type                                   | Required                                   | Description                                                    |
| ------------------------- | -------------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `url`                     | `string`                               | ✅                                         | Base URL for sending HTTP requests                             |
| `logger`                  | `boolean`                              | ❌                                         | Enable request/response logging (for debugging)                |
| `auth`                    | `AxiosBasicCredentials`                | ❌                                         | HTTP Basic Auth credentials (`{ username, password }`)         |
| `env`                     | `ConfigEnvType`                        | ❌ _(if no set env variable in .env file)_ | API keys and environment secrets                               |
| `env.PRIVATE_KEY`         | `string`                               | ✅ _(if used)_                             | Your private key (used in secure requests)                     |
| `env.PUBLIC_KEY`          | `string`                               | ✅ _(if used)_                             | Your public key (used in client-side logic)                    |
| `setting`                 | `Partial<ConfigSettingType>`           | ❌                                         | Additional settings for features like Telegram error reporting |
| `setting.telegram`        | `boolean`                              | ✅ _(if Telegram used)_                    | Telegram Bot used for error notifications                      |
| `middleware`              | `Partial<ConfigMiddlewareType>`        | ❌                                         | server **Middleware** settings                                 |
| `middleware.headers`      | `Partial<ConfigMiddlewareHeadersType>` | ❌                                         | headers names                                                  |
| `middleware.errors`       | `Partial<ConfigMiddlewareErrorsType>`  | ❌                                         | handlers errors                                                |
| `middleware.skip_routers` | `Partial<ConfigMiddlewareErrorsType>`  | ❌                                         | add router to not check                                        |
| `middleware.powerd_by`    | `string`                               | ❌                                         | add custom powerd_by                                           |

---

## 📫 Telegram Integration

To enable error reporting:

1. Set `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID` in your environment variables.
2. Enable it in the config:

ts
new ApiService({
url: "...",
setting: { telegram: true }
});

Any 500/403 errors on the server will now be sent to your Telegram chat instantly.

---

## License

MIT © [Alyvro](https://github.com/Alyvro)
