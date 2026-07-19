from flask import jsonify

from app.exceptions.custom_exception import DevAuditException

def register_error_handler(app):

    @app.errorhandler(DevAuditException)
    def handle_custom_exception(error):

        return jsonify({
            "status" : "false",
            "message" : error.message
        }), error.status_code
    
    @app.errorhandler(Exception)
    def handle_unexpected_exception(error):

        print(error)

        return jsonify({
            "status" : "false",
            "message" : "Internal Server Error",
            "data" : None
        }), 500