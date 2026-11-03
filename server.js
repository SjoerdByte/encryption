import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const app = express();
const root = join(dirname(fileURLToPath(import.meta.url)), "public");

app.use(express.static(root));

const port = 3000;
app.listen(port, () => {
    console.log(`Draait op http://localhost:${port}`);
});
