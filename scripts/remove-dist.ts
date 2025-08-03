import { rmSync, existsSync } from "fs";
import { join } from "path";

const distPath = join(__dirname, "..", "dist");

function remove() {
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
    console.log("✅ dist folder removed.");
  } else {
    console.log("⚠️ no dist folder found");
  }
}

remove();
