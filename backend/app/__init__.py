from flask import Flask
from flask_cors import CORS

from app.routes.health import health_bp
from app.routes.github import github_bp
from app.routes.repository_reports import repository_bp

from app.database.connection import mongo

from app.handlers.error_handler import register_error_handler

from app.repository.repository_manager import RepositoryManager

def create_app():

    app = Flask(__name__)

    app.config.from_object("app.config.Config")

    mongo.init_app(app)
    
    CORS(app)

    register_error_handler(app)

    RepositoryManager.initialize()

    app.register_blueprint(health_bp)
    app.register_blueprint(github_bp)
    app.register_blueprint(repository_bp)

    return app

