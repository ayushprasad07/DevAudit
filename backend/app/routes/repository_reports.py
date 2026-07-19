from flask import Blueprint, request, jsonify

from app.services.repository_service import RepositoryService

from app.utils.serializer import serialize

repository_bp = Blueprint(
    "repository",
    __name__,
    url_prefix="/api/repositories"
)


@repository_bp.route(
    "/analyze",
    methods=["POST"]
)
def analyze():

    data = request.get_json(silent=True)

    print("Headers:", request.headers)
    print("Body:", request.data)
    print("JSON:", data)

    repository_url = data.get("repository_url")

    if not repository_url:
        return jsonify({
            "message": "repository_url is required"
        }), 400

    report = RepositoryService.analyze_repository(
        repository_url
    )

    return jsonify(
        serialize(report)
    ), 200