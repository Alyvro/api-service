# ⚡ @alyvro/api-service

[![Socket Badge](https://badge.socket.dev/npm/package/@alyvro/api-service/1.0.3)](https://socket.dev/npm/package/@alyvro/api-service/overview)
![CI](https://github.com/Alyvro/api-service/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/@alyvro/api-service)

**A minimal yet powerful service for sending HTTP requests on the client and handling them gracefully on the server. No complicated setup. Just plug in your keys — and you're ready to go.**

### 🚀 Features

- ✅ Effortless HTTP requests on the client — built on top of Axios
- ✅ Built-in fetch support for client-side requests
- ✅ Express middleware support — add it once and manage everything centrally
- ✅ Auto error reporting to Telegram — just provide your bot token & chat ID
- ✅ Fully configurable via a simple object
- ✅ Plugin system for extra features (Cache, Compressor, Retry, Cancel, …)
- ✅ Lightweight, fast, and production-ready

### 📦 Installation

```bash
pnpm add @alyvro/api-service
# or
npm install @alyvro/api-service
# or
yarn add @alyvro/api-service
```

---

## ✨ Usage

### ➤ Client-side

```ts
import { ApiService } from "@alyvro/api-service";
import { cache, createAbortController } from "@alyvro/api-service/plugins";

const api = new ApiService({ api_url: "https://api.alyvro.com" });

// Example: Request with cache, compressor, and retry
const controller = createAbortController();

// Using Axios
const axiosResponse = await api.client.axios.request.post(
  "/user",
  { index: "foo" },
  {
    secret: { body: true },
    signal: controller.signal,
    plugins: {
      // cache:cache or ApiService.plugins.cache,
      compressor: true,
      retry: { retries: 5, retryDelay: 500, backoff: true },
    },
  }
);

// Using fetch
const fetchResponse = await api.client.fetch.request("/user", {
  method: "POST",
  body: { index: "foo" },
  signal: controller.signal,
});

// Cancel request if needed
controller.abort();
```

- `cache` → stores and reuses previous responses to reduce duplicate requests (client & server safe)
- `compressor` → automatically compresses/decompresses payloads when supported by the server
- `retry` → automatic per-request retry with configurable attempts, delay, and backoff
- `createAbortController` → allows canceling requests on demand
- ⚠️ **Note:** Plugins currently only work with Axios. Fetch does **not** support Axios plugins yet.

---

### ➤ Server-side (Express)

```ts
import express from "express";
import { ApiService } from "@alyvro/api-service";

const app = express();

const api = new ApiService({
  url: "https://alyvro.com",
  settings: { telegram: true }, // enables Telegram error reporting
  middleware: {
    skip_routers: ["/health", "/status"],
  },
});

// Middleware with skip_routers option
app.use((req, res, next) => api.server.middleware(req, res, next));

app.get("/", (req, res) => {
  res.json({ message: "Hello world!" });
});
```

Middleware now supports skipping routes via `skip_routers`. Requests matching any path in this array will bypass the middleware.

All server errors will automatically be sent to your Telegram bot.

---

## ⚙️ Config Options

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

## 🧩 Plugins

Plugins allow extending the functionality of requests and middleware. They are configured **per-request**.

### Built-in Plugins

- **Cache**
  Stores last response and prevents duplicate requests with identical payloads.

- **Compressor**
  Compresses request payloads and automatically decompresses gzip responses.

- **Retry**
  Automatically retries failed requests.

  ```ts
  plugins: { retry: { retries: 5, retryDelay: 500, backoff: true } }
  ```

- **Cancel**
  Allows canceling requests using `AbortController`.

  ```ts
  import { createAbortController } from "@alyvro/api-service/plugins";
  const controller = createAbortController();
  api.get("/users", { signal: controller.signal });
  controller.abort();
  ```

> ⚠️ **Note:** Plugins currently only work with Axios. Fetch does **not** support Axios plugins yet.

---

## 📫 Telegram Error Reporting

Errors can be automatically sent to Telegram. Just provide your bot token and chat ID in the config.

---

## 📘 License

MIT License

Copyright (c) 2025 Alyvro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
