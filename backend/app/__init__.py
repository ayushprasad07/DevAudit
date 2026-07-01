from flask import Flask
from flask_cors import CORS

from app.routes.health import health_bp
from app.routes.github import github_bp

def create_app():

    app = Flask(__name__)

    app.config.from_object("app.config.Config")
    
    CORS(app)

    app.register_blueprint(health_bp)
    app.register_blueprint(github_bp)

    return app

