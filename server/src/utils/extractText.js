const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

// simple helper to clean up whitespace and empty lines
function normalizeText(raw) {
  if (!raw) return "";
  // split into lines, trim each, filter out blank lines
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  // collapse multiple spaces within a line
  return lines.map((l) => l.replace(/\s+/g, " ")).join("\n");
}

async function extractTextFromFile(filePath, mimeType) {
  if (!mimeType) throw new Error("File MIME type is required");

  if (mimeType.includes("pdf")) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return normalizeText(data.text);
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return normalizeText(result.value);
  }

  throw new Error("Unsupported file type");
}

module.exports = { extractTextFromFile, normalizeText };