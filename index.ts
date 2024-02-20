import { drive } from "@googleapis/drive";
import fs from "fs";
import path from "path";

const driveClient = drive({
  version: "v3",
  auth: process.env.DRIVE_API_KEY,
});

function isString(value: unknown): value is string {
  return typeof value === "string";
}

async function main() {
  const file = await driveClient.files.export({
    fileId: "1Vnjq-zAN3x7LlF2YKXY5EmpDy5hn_R_0yhbFvusNeXM",
    mimeType: "text/html",
  });
  if (isString(file.data)) {
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }
    fs.writeFileSync(path.join("data", "tournament-updates.html"), file.data);
  }
}

main();
