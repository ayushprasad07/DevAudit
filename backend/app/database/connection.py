from pymongo import MongoClient


class Mongo:

    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self, app):

        self.client = MongoClient(app.config["MONGO_URI"])
        self.db = self.client[app.config["DATABASE_NAME"]]

        self.db["package_cache"].create_index(
            "name",
            unique=True
        )

        print("Connected to MongoDB")

    def get_db(self):
        return self.db
    
        
mongo  = Mongo()