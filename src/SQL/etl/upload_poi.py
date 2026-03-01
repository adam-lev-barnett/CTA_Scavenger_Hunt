"""
Based on the mock datatset ETL created by Claude.
Upload to the point_of_interests table logic
was separated and connected to real dataset 
obtained through Overpass Openstreet database. 

The parsing of the Overpass GeoJON file is performed
by the Parser.py module and the input data is organized
and uploaded via sqlite3
"""
import sqlite3
import os
from datetime import datetime, timedelta
import Parser

# establish database connection
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "chica_go.db")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Enable FK enforcement for this session — required every connection in SQLite
cursor.execute("PRAGMA foreign_keys = ON")

# reset table to prevent duplicates
cursor.execute("DELETE FROM point_of_interests;")
print("Table truncated")

stations_raw, pois_raw = Parser.build_poi_list("poi.geojson", "stations.geojson")

# printout results for sanity check
print("Num stations: ", len(stations_raw))
print("Num pois: ", len(pois_raw))

station_map = {}  # maps station_name → assigned id, used when seeding POIs below

for _station in stations_raw:
    poi_name = _station['name']
    longitude = _station['longitude']
    latitude = _station['latitude']
    points = _station['points']

    # Step 1: insert with station_id = NULL
    cursor.execute(
        "INSERT INTO point_of_interests (poi_name, longitude, latitude, station_id, points) VALUES (?, ?, ?, NULL, ?)",
        (poi_name, longitude, latitude, points)
    )
    new_id = cursor.lastrowid

    # Step 2: set station_id = its own id (self-reference marks this row as a station)
    cursor.execute(
        "UPDATE point_of_interests SET station_id = ? WHERE id = ?",
        (new_id, new_id)
    )
    station_map[poi_name] = new_id

print(f"Inserted {len(stations_raw)} stations")

# POI Upload ETL
for _poi in pois_raw:
    poi_name = _poi['name']
    longitude = _poi['longitude']
    latitude = _poi['latitude']
    station_lookup = _poi['nearest_station']
    points = _poi['points']
    station_id = station_map.get(station_lookup) if station_lookup else None
    cursor.execute(
        "INSERT INTO point_of_interests (poi_name, longitude, latitude, station_id, points) VALUES (?, ?, ?, ?, ?)",
        (poi_name, longitude, latitude, station_id, points)
    )

print(f"Inserted {len(pois_raw)} POIs")

# commit/close connection
conn.commit()
cursor.close()
conn.close()
print("\npoint_of_interests table upload ETL completed — chica_go.db is ready.")