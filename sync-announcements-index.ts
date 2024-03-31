import { drive } from "@googleapis/drive";
import fs from "fs";
import path from "path";
import { getH1GroupsFromHTML } from "./utils";

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
  if (!isString(file.data)) {
    return;
  }
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  // Write the HTML document of announcements
  fs.writeFileSync(path.join("data", "tournament-updates.html"), file.data);

  const parsedAnnouncements = getH1GroupsFromHTML(file.data);
  
  // Write the JSON file of announcements
  fs.writeFileSync(path.join("data", "tournament-updates.json"), JSON.stringify(parsedAnnouncements))
}

main();
