from app.database.connection import mongo

class PackageCacheModel:

    COLLECTION = "package_cache"

    @staticmethod
    def collection():
        return mongo.get_db()[PackageCacheModel.COLLECTION]
    
    @staticmethod
    def find_by_name(package_name):
        return PackageCacheModel.collection().find_one({"name" : package_name})
    
    @staticmethod
    def create(data : dict):

        return PackageCacheModel.collection().insert_one(data)
    
    @staticmethod
    def update(package_name : str, data : dict):

        return PackageCacheModel.collection().update_one({
            "name" : package_name
        },{
            "$set" : data
        },
        upsert=True
        )
    
    @staticmethod
    def delete(package_name : str):

        return PackageCacheModel.collection().delete_one({
            "name" : package_name
        })
