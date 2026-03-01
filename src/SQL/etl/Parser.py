import os
import json
import numpy as np

def Parser(filename, point=10):
    """
    outputs a list of dict
    """
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
                "latitude": float(lat),
                "longitude": float(lon),
                "points": point
            })

    return results

def get_nearest_station(poi:dict, stations:list) -> dict:
    """
    """
    _stations = []
    poi_pt = np.array((poi['latitude'], poi['longitude']))
    for station in stations:
        station_pt = np.array((station['latitude'], station['longitude']))
        _dist = np.linalg.norm(poi_pt - station_pt)
        _stations.append((_dist, station['name']))
    
    _stations = list(sorted(_stations, key=lambda x: x[0]))
    return _stations[0][1] # lowest _dst, name

def build_poi_list(poi_filepath, stations_filepath) -> tuple:
    """
    return a list of dicts from both datasets
    """
    stations = Parser(stations_filepath)
    _pois = Parser(poi_filepath, 5)
    pois = []
    for _poi in _pois:
        pois.append(
            {
                "name": _poi["name"],
                "latitude": float(_poi["latitude"]),
                "longitude": float(_poi["longitude"]),
                "nearest_station": get_nearest_station(_poi, stations),
                "points": _poi["points"]
            }
        )

    return (stations, pois)


def test_nearest_station():
    pois = Parser("poi.geojson")
    stations = Parser("stations.geojson", 5)
    return get_nearest_station(pois[0], stations)

if __name__ == "__main__":
    _out = build_poi_list("poi.geojson", "stations.geojson")
    print("stations: ", _out[0])
    print("pois: ", _out[1])