"""MongoDB document serialization utilities for JSON compatibility."""

from bson import ObjectId


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict.
    
    Converts ObjectId fields to strings recursively.
    """
    if doc is None:
        return None
    
    result = {}
    for key, value in doc.items():
        if key == '_id':
            # Convert ObjectId _id to string, rename to 'id'
            result['id'] = str(value)
        elif isinstance(value, ObjectId):
            # Convert any ObjectId field to string
            result[key] = str(value)
        elif isinstance(value, list):
            # Handle lists that may contain documents or ObjectIds
            result[key] = [
                serialize_doc(i) if isinstance(i, dict) else str(i) 
                if isinstance(i, ObjectId) else i 
                for i in value
            ]
        elif isinstance(value, dict):
            # Recursively serialize nested documents
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    
    return result


def serialize_list(docs):
    """Convert list of MongoDB documents to JSON-serializable list."""
    return [serialize_doc(doc) for doc in docs]
