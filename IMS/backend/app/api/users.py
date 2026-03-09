from fastapi import APIRouter, Query


router = APIRouter()

# Temporary dummy data
users = [
    {"id": 1, "name": "John", "role": "teacher"},
    {"id": 2, "name": "Ahmed", "role": "admin"},
    {"id": 3, "name": "Sara", "role": "student"},
]

@router.get("/users")
def get_users(role: Optional[str] = Query(None)):
    if role:
        return [u for u in users if u["role"] == role]
    return users