import express from "express";
import { ApiService } from "@alyvro/api-service";
import "dotenv/config";

const app = express();
const port = 3001;

app.use(express.json());

const apiService = new ApiService({
  url: "https://alyvro.com",
  env: {
    PRIVATE_KEY: "",
    PUBLIC_KEY: "",
  },
  setting: {
    telegram: true,
  },
});

app.use((req, res, next) => apiService.server.middleware(req, res, next));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express + @alyvro/api-service!" });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
