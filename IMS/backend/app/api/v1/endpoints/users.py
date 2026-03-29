from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

# Dummy DB (replace later if needed)
users_db = [
    {"id": 1, "name": "John Doe", "email": "john@gmail.com", "role": "TEACHER"},
    {"id": 2, "name": "Alice", "email": "alice@gmail.com", "role": "STUDENT"},
    {"id": 3, "name": "Bob", "email": "bob@gmail.com", "role": "ADMIN"},
    {"id": 4, "name": "David", "email": "david@gmail.com", "role": "TEACHER"},
]

# ✅ FIXED ROUTE
@router.get("/")
def get_users(
    limit: int = Query(10),
    offset: int = Query(0),
    role: Optional[str] = None,
    search: Optional[str] = None,
):
    filtered_users = users_db

    # Filter by role
    if role:
        filtered_users = [u for u in filtered_users if u["role"] == role]

    # Search by name/email
    if search:
        filtered_users = [
            u for u in filtered_users
            if search.lower() in u["name"].lower()
            or search.lower() in u["email"].lower()
        ]

    total = len(filtered_users)

    # Pagination
    paginated_users = filtered_users[offset: offset + limit]

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": paginated_users
    }