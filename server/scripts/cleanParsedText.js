const mongoose = require("mongoose");
const Resume = require("../src/models/resume.model").default;
const { normalizeText } = require("../src/utils/extractText");

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/yourdb";
  await mongoose.connect(uri);

  const docs = await Resume.find({});
  console.log(`Found ${docs.length} resume(s)`);

  for (const doc of docs) {
    const original = doc.parsedText || "";
    const cleaned = normalizeText(original);
    if (cleaned !== original) {
      doc.parsedText = cleaned;
      await doc.save();
      console.log("updated", doc._id.toString());
    }
  }

  await mongoose.disconnect();
  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
