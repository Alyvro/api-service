import React, { useEffect, useState } from "react";
import { ApiService } from "@alyvro/api-service";

const apiService = new ApiService({
  url: "https://api.alyvro.com/api",
  env: {
    PRIVATE_KEY: "",
    PUBLIC_KEY: "",
  },
});

// Define endpoint types
const api = apiService.client.axios.request<{
  "/hello": { message: string };
}>();

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    /**
     * 🧱 Example 1: Direct request (without authentication)
     *
     * This request is sent directly to the backend (Express).
     * Since it doesn't include any API keys or signed headers,
     * the server responds with a 403 Forbidden status.
     *
     * This demonstrates that your API is secure and only allows
     * verified requests to access protected endpoints.
     */
    fetch("http://localhost:3001/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    /**
     * 🔐 Example 2: Secure request (using ApiService)
     *
     * In this case, we use ApiService, which automatically:
     * - Adds the public/private API keys to the request headers.
     * - Signs the request so the server can verify its authenticity.
     *
     * As a result, the request succeeds (status 200),
     * and we receive the response message from the API.
     */
    api
      .get("/hello")
      .then((res) => res.data)
      .then((data) => setMessage(data.message))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>React + Express Example</h1>
      <p>{message || "Loading..."}</p>
    </div>
  );
}
