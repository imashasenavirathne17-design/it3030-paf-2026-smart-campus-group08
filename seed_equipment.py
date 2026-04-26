import pymongo
from datetime import datetime

uri = "mongodb+srv://db_user:user%40123@it3030-paf-2026-smart-c.oi5o5p8.mongodb.net/?appName=it3030-paf-2026-smart-campus-group08"
client = pymongo.MongoClient(uri)
db = client["smart_campus"]
resources = db["resources"]
resources.delete_many({})

equipment = [
    { "name": "Sony VPL-PHZ60 Projector", "type": "Projector", "location": "IT Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "4K Laser Projector" },
    { "name": "Epson EB-L200F Projector", "type": "Projector", "location": "IT Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "1080p Wireless Projector" },
    { "name": "Canon EOS R5 Camera", "type": "Camera", "location": "Media Room", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "8K Mirrorless Camera" },
    { "name": "MacBook Pro M3", "type": "Laptop", "location": "IT Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "16GB RAM, 512GB SSD" },
    { "name": "MacBook Air M2", "type": "Laptop", "location": "IT Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "8GB RAM, 256GB SSD" },
    { "name": "Dell XPS 15", "type": "Laptop", "location": "IT Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "32GB RAM, 1TB SSD" },
    { "name": "Shure SM7B", "type": "Microphone", "location": "Media Room", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "Dynamic Vocal Microphone" },
    { "name": "Rode Wireless GO II", "type": "Microphone", "location": "Media Room", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "Dual Wireless Mic System" },
    { "name": "JBL PartyBox 310", "type": "Speaker", "location": "Event Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "Portable Bluetooth Speaker" },
    { "name": "Bose S1 Pro", "type": "Speaker", "location": "Event Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "Multi-position PA System" },
    { "name": "10m Extension Cord A", "type": "Extension Cord", "location": "IT Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "Heavy duty 4-socket cord" },
    { "name": "25m Extension Cord B", "type": "Extension Cord", "location": "IT Store", "capacity": 1, "status": "ACTIVE", "_class": "com.smartcampus.model.Resource", "createdAt": datetime.now(), "description": "Industrial extension reel" }
]

result = resources.insert_many(equipment)
print(f"Inserted {len(result.inserted_ids)} equipment resources successfully!")
