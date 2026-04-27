const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://db_user:user%40123@it3030-paf-2026-smart-c.oi5o5p8.mongodb.net/?appName=it3030-paf-2026-smart-campus-group08";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("smart_campus");
    const resources = db.collection("resources");

    // Clear existing to match the requested dummy data perfectly
    await resources.deleteMany({});

    const newResources = [
      // 1st Floor
      { name: "LH101", type: "Lecture Hall", location: "Floor 1", capacity: 100, status: "ACTIVE" },
      { name: "LH102", type: "Lecture Hall", location: "Floor 1", capacity: 100, status: "ACTIVE" },
      // 2nd Floor
      { name: "LH201", type: "Lecture Hall", location: "Floor 2", capacity: 80, status: "ACTIVE" },
      { name: "LH202", type: "Lecture Hall", location: "Floor 2", capacity: 80, status: "ACTIVE" },
      { name: "LH203", type: "Lecture Hall", location: "Floor 2", capacity: 80, status: "ACTIVE" },
      { name: "LH204", type: "Lecture Hall", location: "Floor 2", capacity: 80, status: "ACTIVE" },
      // 3rd Floor
      { name: "LH301", type: "Lecture Hall", location: "Floor 3", capacity: 80, status: "ACTIVE" },
      { name: "LH302", type: "Lecture Hall", location: "Floor 3", capacity: 80, status: "ACTIVE" },
      { name: "LH303", type: "Lecture Hall", location: "Floor 3", capacity: 80, status: "ACTIVE" },
      { name: "LH304", type: "Lecture Hall", location: "Floor 3", capacity: 80, status: "ACTIVE" },
      // 4th Floor
      { name: "Lab401", type: "Laboratory", location: "Floor 4", capacity: 40, status: "ACTIVE" },
      { name: "Lab402", type: "Laboratory", location: "Floor 4", capacity: 40, status: "ACTIVE" },
      { name: "Lab403", type: "Laboratory", location: "Floor 4", capacity: 40, status: "ACTIVE" },
      { name: "Lab404", type: "Laboratory", location: "Floor 4", capacity: 40, status: "ACTIVE" },
      { name: "LH405", type: "Lecture Hall", location: "Floor 4", capacity: 60, status: "ACTIVE" },
      // 5th Floor
      { name: "LH501", type: "Lecture Hall", location: "Floor 5", capacity: 60, status: "ACTIVE" },
      { name: "LH502", type: "Lecture Hall", location: "Floor 5", capacity: 60, status: "ACTIVE" },
      { name: "LH503", type: "Lecture Hall", location: "Floor 5", capacity: 60, status: "ACTIVE" },
      { name: "LH504", type: "Lecture Hall", location: "Floor 5", capacity: 60, status: "ACTIVE" },
      // 6th Floor
      { name: "LH601", type: "Lecture Hall", location: "Floor 6", capacity: 150, status: "ACTIVE" },
      { name: "LH602", type: "Lecture Hall", location: "Floor 6", capacity: 150, status: "ACTIVE" }
    ];

    const result = await resources.insertMany(newResources.map(r => ({ ...r, _class: "com.smartcampus.model.Resource", createdAt: new Date() })));
    console.log(`${result.insertedCount} resources inserted.`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
