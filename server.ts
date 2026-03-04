import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.listen(8888, "0.0.0.0", () => {
  console.log("🏯 吉宗サーバー起動: http://0.0.0.0:8888");
});
