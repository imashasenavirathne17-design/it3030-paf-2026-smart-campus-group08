const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://db_user:user%40123@it3030-paf-2026-smart-c.oi5o5p8.mongodb.net/?appName=it3030-paf-2026-smart-campus-group08";
const client = new MongoClient(uri);

async function cleanDuplicates() {
  try {
    await client.connect();
    const db = client.db("smart_campus");
    const resources = db.collection("resources");

    console.log("Finding duplicates...");
    const allResources = await resources.find({}).toArray();
    
    const seen = new Map();
    const toDelete = [];

    allResources.forEach(r => {
      if (seen.has(r.name)) {
        const existing = seen.get(r.name);
        // Keep the newer one
        if (new Date(r.updatedAt || r.createdAt) > new Date(existing.updatedAt || existing.createdAt)) {
          toDelete.push(existing._id);
          seen.set(r.name, r);
        } else {
          toDelete.push(r._id);
        }
      } else {
        seen.set(r.name, r);
      }
    });

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} duplicates. Deleting...`);
      const result = await resources.deleteMany({ _id: { $in: toDelete } });
      console.log(`${result.deletedCount} duplicates removed.`);
    } else {
      console.log("No duplicates found.");
    }

  } catch (err) {
    console.error("Error cleaning duplicates:", err);
  } finally {
    await client.close();
  }
}

cleanDuplicates().catch(console.dir);
