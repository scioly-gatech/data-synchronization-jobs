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
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  const masterImageFolderPath = path.join(".", "data", "images");
  if (!fs.existsSync(masterImageFolderPath)) {
    fs.mkdirSync(masterImageFolderPath);
  }

  const driveImageFolderId = process.env.DRIVE_IMAGE_FOLDER_ID;
  const imagePrefix = process.env.IMAGE_PREFIX ?? "scioly";
  const imageFileType = process.env.IMAGE_FILE_TYPE ?? "jpg";

  if (driveImageFolderId == undefined) {
    console.error(
      "Please provide the DRIVE_IMAGE_FOLDER_ID value as repository variables"
    );
    return;
  }

  const imageFolderPath = path.join(".", "data", "images", imagePrefix);

  const response = await driveClient.files.list({
    q: `'${driveImageFolderId}' in parents`,
  });

  const files = response.data.files;

  if (!fs.existsSync(imageFolderPath)) {
    fs.mkdirSync(imageFolderPath);
  }

  if (files == undefined) {
    console.log("No files found in google drive image folder.");
    return;
  }

  let sequenceNum = 0;
  for (const file of files) {
    if (file.id != null && file.mimeType?.startsWith("image")) {
      const filePath = path.join(
        "data",
        "images",
        imagePrefix,
        `${imagePrefix}_${sequenceNum}.${imageFileType}`
      );
      sequenceNum++;
      const destinationFile = fs.createWriteStream(filePath);
      try {
        const response = await driveClient.files.get(
          {
            fileId: file.id,
            alt: "media",
          },
          { responseType: "stream" }
        );

        response.data
          .on("error", (err: any) => {
            console.error(`Error downloading file ${file.name}:`, err);
          })
          .on("end", () => {
            console.log(`File ${file.name} downloaded successfully.`);
          })
          .pipe(destinationFile);
      } catch (error) {
        console.error(`Error downloading file ${file.name}:`, error);
      }
    }
  }
}

main();
