# ⚡ @alyvro/api-service

**A minimal yet powerful service for sending HTTP requests on the client and handling them gracefully on the server. No complicated setup. Just plug in your keys — and you're ready to go.**

### 🚀 Features

- ✅ Effortless HTTP requests on the client — built on top of Axios

- ✅ Express middleware support — add it once and manage everything centrally

- ✅ Auto error reporting to Telegram — just provide your bot token & chat ID

- ✅ Fully configurable via a simple object

- ✅ Lightweight, fast, and production-ready

### 📦 Installation

```bash
pnpm add @alyvro/api-service
# or
npm install @alyvro/api-service
# or
yarn add @alyvro/api-service
```

## ✨ Usage

### ➤ Client-side

```ts
import { ApiService } from "@alyvro/api-service";

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
  }
);
```

### ➤ Server-side (Express)

```ts
import express from "express";
import { ApiService } from "@alyvro/api-service";

const app = express();

const api = new ApiService({
  api_url: "https://your-backend.com/api",
  settings: {
    telegram: {
      token: "your_bot_token",
      chat_id: "your_chat_id",
    },
  },
});

app.use(api.server.middleware);

app.get("/", (req, res) => {
  throw new Error("Something went wrong!");
});
```

When an error occurs, it will be automatically sent to your Telegram.

## ⚙️ Config Options

| Key                        | Type                         | Required                | Description                                                    |
| -------------------------- | ---------------------------- | ----------------------- | -------------------------------------------------------------- |
| `api_url`                  | `string`                     | ✅                      | Base URL for sending HTTP requests                             |
| `logger`                   | `boolean`                    | ❌                      | Enable request/response logging (for debugging)                |
| `auth`                     | `AxiosBasicCredentials`      | ❌                      | HTTP Basic Auth credentials (`{ username, password }`)         |
| `env`                      | `ConfigEnvType`              | ❌                      | API keys and environment secrets                               |
| `env.PRIVATE_KEY`          | `string`                     | ✅ _(if used)_          | Your private key (can be used in secured requests)             |
| `env.PUBLIC_KEY`           | `string`                     | ✅ _(if used)_          | Your public key (can be used in client-side logic)             |
| `setting`                  | `Partial<ConfigSettingType>` | ❌                      | Additional settings for features like Telegram error reporting |
| `setting.telegram.token`   | `string`                     | ✅ _(if Telegram used)_ | Telegram Bot Token used for error notifications                |
| `setting.telegram.chat_id` | `string`                     | ✅ _(if Telegram used)_ | Telegram Chat/User ID where errors will be sent                |

## 📫 Telegram Error Reporting

One of the standout features of this package is automated Telegram error reporting.
Just provide your bot token and chat ID in the config, and all server errors will be pushed directly to your DM (or group).

## 📘 License

© 2025 Alyvro. All rights reserved.

This project is proprietary software.

You **may fork** this repository **only for personal, educational, or contribution purposes**.

Any other use, including copying, modifying, distributing, or commercial use **is prohibited without prior written permission** from the author.
