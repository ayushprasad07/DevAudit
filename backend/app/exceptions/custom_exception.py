class DevauditException (Exception):

    def __init__(self, message, status_code=500):

        self.message = message
        self.status_code = status_code
        super().__init__(message)
 
    def AuthenticationError(DevAuditException):
         def __init__(self, message="Authentication Failed"):

            super().__init__(message, 401)
    
    def AuthorizationError(DevAuditException):
         def __init__(self, message="Authorization Failed"):

            super().__init__(message, 403)
    

    def GithubAPIError(DevAuditException):
         def __init__(self, message="Github API Error"):

            super().__init__(message, 502)
    

    def DatabaseError(DevAuditException):
         def __init__(self, message="Database Error"):

            super().__init__(message, 500)
    
    def ValidationError(DevAuditException):
         def __init__(self, message="Validation Error"):

            super().__init__(message, 400)
    

    def RepositoryError(DevAuditException):
         def __init__(self, message="Repository Error"):

            super().__init__(message, 500)