from flask import Flask
from flask_pymongo import PyMongo

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Initialize PyMongo and attach it to the Flask app
    mongo = PyMongo(app)

    # Register the routes blueprint
    from app.routes import routes_bp
    app.register_blueprint(routes_bp, url_prefix='/api')

    # Attach the PyMongo instance to the app so it can be accessed elsewhere
    app.mongo = mongo

    return app
