# ⚡ @alyvro/api-service

**A minimal yet powerful service for sending HTTP requests on the client and handling them gracefully on the server. No complicated setup. Just plug in your keys — and you're ready to go.**

### 🚀 Features

- ✅ Effortless HTTP requests on the client — built on top of Axios
- ✅ Express middleware support — add it once and manage everything centrally
- ✅ Auto error reporting to Telegram — just provide your bot token & chat ID
- ✅ Fully configurable via a simple object
- ✅ Plugin system for extra features (Cache, Compressor, …)
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
import { cache, compressor } from "@alyvro/api-service/plugins";

const api = new ApiService({
  api_url: "https://your-backend.com/api",
});

api.client.request.post(
  "/user",
  { index: "foo" },
  {
    secret: {
      body: true,
    },
    plugins: {
      cache,
      compressor,
    },
  }
);
```

- `cache` → stores and reuses previous responses to reduce duplicate requests (client & server safe)
- `compressor` → automatically compresses/decompresses payloads when supported by the server

---

### ➤ Server-side (Express)

```ts
import express from "express";
import { ApiService } from "@alyvro/api-service";

const app = express();

const api = new ApiService({
  api_url: "https://your-backend.com/api",
  settings: {
    /* set TELEGRAM_TOKEN and TELEGRAM_CHAT_ID in your env file if you set telegram:true */
    telegram: true,
  },
});

// middleware with plugins
app.use((req, res, next) =>
  api.server.middleware(req, res, next, {
    cache: true, // enables server-side response caching
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Hello world!" });
});
```

When an error occurs, it will be automatically sent to your Telegram.

---

## ⚙️ Config Options

| Key                | Type                         | Required                | Description                                                    |
| ------------------ | ---------------------------- | ----------------------- | -------------------------------------------------------------- |
| `api_url`          | `string`                     | ✅                      | Base URL for sending HTTP requests                             |
| `logger`           | `boolean`                    | ❌                      | Enable request/response logging (for debugging)                |
| `auth`             | `AxiosBasicCredentials`      | ❌                      | HTTP Basic Auth credentials (`{ username, password }`)         |
| `env`              | `ConfigEnvType`              | ❌                      | API keys and environment secrets                               |
| `env.PRIVATE_KEY`  | `string`                     | ✅ _(if used)_          | Your private key (used in secure requests)                     |
| `env.PUBLIC_KEY`   | `string`                     | ✅ _(if used)_          | Your public key (used in client-side logic)                    |
| `setting`          | `Partial<ConfigSettingType>` | ❌                      | Additional settings for features like Telegram error reporting |
| `setting.telegram` | `boolean`                    | ✅ _(if Telegram used)_ | Telegram Bot used for error notifications                      |

---

## 🧩 Plugins

The new **Plugin System** allows extending the functionality of requests and middleware.

### Built-in Plugins

- **Cache**  
  Stores last response and prevents duplicate requests with identical payloads.

  - Client: prevents duplicate `POST/GET` calls
  - Server: can be enabled via `cache: true` in `middleware`

- **Compressor**
  - Client: sends requests in compressed form if supported
  - Server: automatically decompresses incoming gzip payloads and compresses JSON responses when the client supports gzip

---

## 📫 Telegram Error Reporting

One of the standout features of this package is automated Telegram error reporting.  
Just provide your bot token and chat ID in the config, and all server errors will be pushed directly to your DM (or group).

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
