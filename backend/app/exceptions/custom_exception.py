class DevAuditException(Exception):

    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AuthenticationError(DevAuditException):

    def __init__(self, message="Authentication Failed"):
        super().__init__(message, 401)


class AuthorizationError(DevAuditException):

    def __init__(self, message="Authorization Failed"):
        super().__init__(message, 403)


class GithubAPIError(DevAuditException):

    def __init__(self, message="GitHub API Error"):
        super().__init__(message, 502)


class DatabaseError(DevAuditException):

    def __init__(self, message="Database Error"):
        super().__init__(message, 500)


class ValidationError(DevAuditException):

    def __init__(self, message="Validation Error"):
        super().__init__(message, 400)


class RepositoryError(DevAuditException):

    def __init__(self, message="Repository Error"):
        super().__init__(message, 500)


class ExternalException(DevAuditException):

    def __init__(self, message="External Service Error"):
        super().__init__(message, 500)