from flask import jsonify, Blueprint, current_app

health_bp = Blueprint('healt', __name__)

@health_bp.route("/")
def home():

    return jsonify({
        "status": "server is runing and healthy",
        "debug" : current_app.config["DEBUG"]
    })