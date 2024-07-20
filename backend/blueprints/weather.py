import os
from http import HTTPStatus
import requests
from flask import Blueprint, request, jsonify

OPENWEATHERMAP_API_KEY = os.environ.get('OPENWEATHERMAP_API_KEY')

weather = Blueprint('forecast', __name__)

@weather.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City name is required'}), HTTPStatus.BAD_REQUEST

    url = f'https://api.open-meteo.com/v1/forecast'
    params = {
        'latitude': 0,
        'longitude': 0,
        'current': 'temperature_2m,weathercode',
        'hourly': 'temperature_2m,weathercode',
        'forecast_hours': 25,
        'daily': 'temperature_2m_max,temperature_2m_min,weathercode',
        'timezone': 'auto'
    }

    geo_url = f'http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OPENWEATHERMAP_API_KEY}'
    print(geo_url)
    geo_response = requests.get(geo_url).json()
    if len(geo_response) == 0:
        return jsonify({'error': 'City not found'}), HTTPStatus.NOT_FOUND
    params['latitude'] = geo_response[0]['lat']
    params['longitude'] = geo_response[0]['lon']

    response = requests.get(url, params=params)
    weather_data = response.json()
    print(weather_data)
    for key in ['time', 'temperature_2m', 'weathercode']:
        if key in weather_data['hourly']:
            weather_data['hourly'][key] = weather_data['hourly'][key][1:]
    return jsonify(weather_data), HTTPStatus.OK
