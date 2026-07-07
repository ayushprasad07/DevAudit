from pymongo import MongoClient


class Mongo:

    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self, app):

        self.client = MongoClient(app.config["MONGO_URI"])
        self.db = self.client[app.config["DATABASE_NAME"]]

        print("Connected to MongoDB")
    
        
mongo  = Mongo()