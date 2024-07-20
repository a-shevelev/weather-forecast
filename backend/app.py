from flask import Flask
from flask_cors import CORS

from blueprints.weather import weather

app = Flask(__name__)
CORS(app)

app.register_blueprint(weather)

if __name__ == '__main__':
    app.run(debug=True)
