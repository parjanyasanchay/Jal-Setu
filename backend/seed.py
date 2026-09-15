from database import Base, engine, SessionLocal
from models import Watershed

# Recreate tables to ensure schema matches model definitions
Watershed.__table__.drop(bind=engine, checkfirst=True)
Base.metadata.create_all(bind=engine)
db = SessionLocal()


# Real watershed records across 8 Indian States & 16 Districts
# Structure: (id, name, state, district, priority, area, interventions, monitored, rainfall, ndvi, water, baseNdvi, baseWater, lat, lng, structure, change, confidence, status)
national_watersheds = [
    # Maharashtra - Nashik
    ("WGH-NK-01", "Waghad Watershed", "Maharashtra", "Nashik", "HIGH", 112.5, 18, 15, 684, 0.58, 0.64, 0.46, 0.48, 20.20, 73.95, "Check Dam", "Moderate improvement", 82, "Under Monitoring"),
    ("KDW-NK-02", "Kadwa Watershed", "Maharashtra", "Nashik", "MEDIUM", 96.8, 14, 11, 641, 0.52, 0.57, 0.51, 0.54, 20.12, 73.78, "Farm Pond", "Low change", 61, "Active"),
    ("DRN-NK-03", "Darna Watershed", "Maharashtra", "Nashik", "HIGH", 104.3, 17, 12, 698, 0.61, 0.69, 0.39, 0.31, 19.95, 73.70, "Water Harvesting Structure", "Drastic improvement", 88, "Under Monitoring"),
    ("GNG-NK-04", "Gangapur Watershed", "Maharashtra", "Nashik", "LOW", 88.4, 12, 8, 612, 0.47, 0.44, 0.44, 0.42, 19.92, 73.74, "Farm Pond", "Small change", 58, "Active"),
    ("GRN-NK-05", "Girna Watershed", "Maharashtra", "Nashik", "HIGH", 121.7, 21, 14, 725, 0.66, 0.73, 0.35, 0.28, 20.52, 74.38, "Check Dam", "Drastic improvement", 91, "Under Monitoring"),

    # Maharashtra - Ahmednagar, Pune, Yavatmal
    ("RLG-AH-06", "Ralegan Siddhi Watershed", "Maharashtra", "Ahmednagar", "MEDIUM", 98.2, 26, 24, 490, 0.62, 0.67, 0.41, 0.38, 18.91, 74.41, "Percolation Tank & Earthen Bunds", "Drastic improvement", 94, "Under Monitoring"),
    ("HWR-AH-07", "Hiware Bazar Catchment", "Maharashtra", "Ahmednagar", "LOW", 82.5, 22, 20, 410, 0.59, 0.61, 0.43, 0.40, 19.06, 74.65, "Continuous Contour Trenching", "Moderate improvement", 86, "Active"),
    ("GHD-PN-08", "Ghod River Sub-Watershed", "Maharashtra", "Pune", "HIGH", 118.6, 19, 13, 560, 0.54, 0.58, 0.45, 0.49, 18.88, 74.12, "Sub-surface Dyke & Farm Ponds", "Moderate improvement", 76, "Under Monitoring"),
    ("BMB-YV-09", "Bembla Watershed Basin", "Maharashtra", "Yavatmal", "HIGH", 132.0, 23, 17, 880, 0.57, 0.63, 0.40, 0.35, 20.48, 78.22, "Cement Nala Bunds & Gabions", "Drastic improvement", 87, "Under Monitoring"),

    # Rajasthan - Alwar, Udaipur, Jodhpur
    ("ARV-AL-10", "Arvari River Watershed", "Rajasthan", "Alwar", "HIGH", 145.2, 32, 28, 540, 0.55, 0.60, 0.31, 0.22, 27.28, 76.45, "Traditional Johad & Anicut", "Drastic improvement", 93, "Under Monitoring"),
    ("AYD-UD-11", "Ayad-Udaisagar Catchment", "Rajasthan", "Udaipur", "MEDIUM", 108.4, 16, 12, 610, 0.48, 0.51, 0.42, 0.44, 24.60, 73.74, "Masonry Check Dam & Terracing", "Low change", 64, "Active"),
    ("LUN-JD-12", "Bandi-Luni Sub-Catchment", "Rajasthan", "Jodhpur", "HIGH", 160.5, 15, 9, 380, 0.38, 0.42, 0.32, 0.35, 25.77, 73.32, "Kadin & Tanka Recharge System", "Moderate improvement", 71, "Under Monitoring"),

    # Madhya Pradesh - Jhabua, Indore, Betul
    ("HTN-JH-13", "Hathni River Catchment", "Madhya Pradesh", "Jhabua", "HIGH", 125.8, 27, 22, 790, 0.64, 0.68, 0.42, 0.34, 22.35, 74.38, "Loose Boulder Structure & Plugs", "Drastic improvement", 90, "Under Monitoring"),
    ("KSH-IN-14", "Kshipra Headwater Catchment", "Madhya Pradesh", "Indore", "MEDIUM", 114.2, 18, 15, 840, 0.56, 0.61, 0.46, 0.48, 22.82, 75.92, "Stop Dam & Silt Detention", "Moderate improvement", 80, "Active"),
    ("TWA-BT-15", "Tawa Basin Sub-Watershed", "Madhya Pradesh", "Betul", "LOW", 138.6, 14, 11, 1020, 0.68, 0.72, 0.58, 0.61, 22.18, 77.90, "Boulder Bund & Percolation Pit", "Moderate improvement", 85, "Active"),

    # Karnataka - Kolar, Belagavi, Tumakuru
    ("SUJ-KL-16", "Markandeya Watershed", "Karnataka", "Kolar", "HIGH", 95.4, 25, 21, 720, 0.58, 0.64, 0.39, 0.33, 13.02, 78.20, "Sujala Farm Pond with Silt Trap", "Drastic improvement", 89, "Under Monitoring"),
    ("MLP-DH-17", "Malaprabha Headwaters", "Karnataka", "Belagavi", "MEDIUM", 140.0, 20, 16, 1150, 0.71, 0.77, 0.60, 0.65, 15.62, 74.55, "Vented Dam & Bank Stabilization", "Moderate improvement", 88, "Active"),
    ("SHM-TM-18", "Shimsha Sub-Basin", "Karnataka", "Tumakuru", "HIGH", 102.7, 18, 12, 660, 0.49, 0.52, 0.44, 0.46, 13.31, 76.94, "Cascade De-silting & Tank Sluice", "Low change", 67, "Under Monitoring"),

    # Andhra Pradesh & Telangana
    ("PEN-AN-19", "Mid-Pennar Watershed", "Andhra Pradesh", "Anantapur", "HIGH", 152.0, 29, 23, 470, 0.44, 0.50, 0.31, 0.25, 14.55, 77.12, "Rubble Bunds & Sunken Ponds", "Drastic improvement", 86, "Under Monitoring"),
    ("DND-MB-20", "Dindi River Catchment", "Telangana", "Mahabubnagar", "MEDIUM", 110.8, 17, 13, 620, 0.51, 0.55, 0.45, 0.47, 16.74, 78.88, "Mini Percolation Tank & Drains", "Moderate improvement", 74, "Active"),

    # Gujarat - Amreli, Rajkot
    ("SHT-AM-21", "Shetrunji River Catchment", "Gujarat", "Amreli", "HIGH", 128.3, 28, 25, 600, 0.53, 0.62, 0.36, 0.29, 21.32, 71.02, "Cement Check Dam & Bori Bandhan", "Drastic improvement", 92, "Under Monitoring"),
    ("BHD-RJ-22", "Bhadar River Basin", "Gujarat", "Rajkot", "MEDIUM", 119.5, 21, 16, 580, 0.48, 0.56, 0.41, 0.46, 21.96, 70.80, "Recharge Borewell & Pond", "Moderate improvement", 79, "Active"),

    # Tamil Nadu - Coimbatore
    ("NOY-CB-23", "Noyyal River Basin", "Tamil Nadu", "Coimbatore", "MEDIUM", 115.4, 22, 19, 710, 0.63, 0.69, 0.52, 0.55, 10.98, 76.90, "Infiltration Wells & Check Dams", "Moderate improvement", 84, "Active"),
]

for x in national_watersheds:
    db.add(Watershed(
        watershed_id=x[0],
        name=x[1],
        state=x[2],
        district=x[3],
        priority=x[4],
        area=x[5],
        interventions=x[6],
        monitored=x[7],
        rainfall=x[8],
        ndvi=x[9],
        water_index=x[10],
        base_ndvi=x[11],
        base_water=x[12],
        lat=x[13],
        lng=x[14],
        structure=x[15],
        change=x[16],
        confidence=x[17],
        status=x[18]
    ))

db.commit()
db.close()
print(f"Jal Setu database successfully seeded with {len(national_watersheds)} national watersheds across 8 Indian States!")
