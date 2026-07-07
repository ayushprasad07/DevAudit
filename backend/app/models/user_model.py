from datetime import datetime
from bson import ObjectId
from dataclasses import asdict

from app.database.connection import mongo

from app.entity.user import User

class UserModel : 

    @staticmethod
    def find_by_github_id(github_id):

        return mongo.db.users.find_one({
            "github_id" : github_id
        })
    
    @staticmethod
    def find_by_id(user_id):

        return mongo.db.users.find_one({
            "_id" : ObjectId(user_id)
        })
    
    @staticmethod
    def create(user : User):

        user_data = asdict(user)

        user_data['created_at'] = datetime.utcnow()

        result = mongo.db.users.insert_one(user_data)

        return mongo.db.users.find_one({"_id": result.inserted_id})
    
    @staticmethod
    def update_github_token(user_id, token):

        mongo.db.users.update_one({
            "_id" : ObjectId(user_id)
        },{
            "$set" : {
                "github_token" : token
            }
        })

    @staticmethod
    def update(user_id, data):

        mongo.db.users.update_one({
            "_id" : ObjectId(user_id)
        },{
            "$set" : data
        })
    
    @staticmethod
    def update_last_login(user_id):

        mongo.db.users.update_one({
            "_id" : ObjectId(user_id)
        },{
            "$set" : {
                "last_login" : datetime.utcnow()
            }
        })