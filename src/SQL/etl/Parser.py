import os
import json

def Parser(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, filename)

    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    results = []

    for feature in data.get("features", []):
        properties = feature.get("properties", {})
        geometry = feature.get("geometry", {})

        name = properties.get("name")
        geom_type = geometry.get("type")
        coordinates = geometry.get("coordinates")

        if name and geom_type == "Point" and isinstance(coordinates, list) and len(coordinates) == 2:
            lon, lat = coordinates
            results.append({
                "name": name,
                "latitude": lat,
                "longitude": lon
            })

    return results


if __name__ == "__main__":
    stations = Parser("stations.geojson")
    print(stations)