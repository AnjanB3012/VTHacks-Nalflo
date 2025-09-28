import requests


city = 'Blacksburg'

# Blacksburg coordinates
coords = {
    "Blacksburg": {"lat": 37.2296, "lon": -80.4139}
}

if city not in coords:
    print("City not supported")

url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": coords[city]["lat"],
    "longitude": coords[city]["lon"],
    "current_weather": True
}

response = requests.get(url, params=params)
if response.status_code == 200:
    weather = response.json()["current_weather"]
    print({
        "city": city,
        "temperature": weather["temperature"],
        "windspeed": weather["windspeed"],
        "time": weather["time"]
    })
else:
    print("Failed to fetch weather")