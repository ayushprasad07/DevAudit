from pydantic import BaseModel, HttpUrl

class RepositoryRequest(BaseModel):
    url: HttpUrl
    commit : str

class AccquiredRepository(BaseModel):
    path : str
    commit : str