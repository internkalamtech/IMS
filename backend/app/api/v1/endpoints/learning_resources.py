"""
Learning Resources API endpoints.

Handles CRUD operations for learning materials (PDFs, PPTs, Videos, Links, etc.)
that students can access organized by subject and class.
"""

import os
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import LearningResourceModel
from app.api.schemas import LearningResourceResponse

router = APIRouter(prefix="/learning-resources", tags=["Learning Resources"])
UPLOAD_DIRECTORY = "uploads/resources"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# Allowed file types for upload
ALLOWED_FILE_TYPES = {
    "pdf": "application/pdf",
    "ppt": ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    "doc": ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
}


# ✅ GET RESOURCES BY SUBJECT
@router.get("/subject/{subject_id}", response_model=list[LearningResourceResponse])
async def get_resources_by_subject(
    subject_id: int,
    class_id: int = Query(...),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get learning resources for a specific subject and class."""
    try:
        query = select(LearningResourceModel).where(
            (LearningResourceModel.subject_id == subject_id)
            & (LearningResourceModel.class_id == class_id)
            & (LearningResourceModel.is_published == True)
        )

        if category:
            query = query.where(LearningResourceModel.category == category)

        result = await db.execute(query)
        resources = result.scalars().all()

        return [LearningResourceResponse(**resource.__dict__) for resource in resources]

    except Exception as e:
        print("GET RESOURCES ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET ALL RESOURCES FOR STUDENT BY CLASS AND SUBJECTS
@router.get("/student/{student_id}", response_model=list[LearningResourceResponse])
async def get_student_resources(
    student_id: int,
    class_id: int = Query(...),
    resource_type: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get all learning resources available for a student based on their class."""
    try:
        query = select(LearningResourceModel).where(
            (LearningResourceModel.class_id == class_id)
            & (LearningResourceModel.is_published == True)
        )

        if resource_type:
            query = query.where(LearningResourceModel.resource_type == resource_type)

        query = query.order_by(LearningResourceModel.created_at.desc())

        result = await db.execute(query)
        resources = result.scalars().all()

        return [LearningResourceResponse(**resource.__dict__) for resource in resources]

    except Exception as e:
        print("GET STUDENT RESOURCES ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET SINGLE RESOURCE
@router.get("/{resource_id}", response_model=LearningResourceResponse)
async def get_resource(
    resource_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific learning resource by ID."""
    try:
        result = await db.execute(
            select(LearningResourceModel).where(LearningResourceModel.id == resource_id)
        )
        resource = result.scalar_one_or_none()

        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")

        return LearningResourceResponse(**resource.__dict__)

    except HTTPException:
        raise
    except Exception as e:
        print("GET RESOURCE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ CREATE RESOURCE (WITH FILE UPLOAD)
@router.post("/", response_model=LearningResourceResponse, status_code=201)
async def create_resource(
    title: str = Form(...),
    description: str | None = Form(None),
    resource_type: str = Form(...),
    category: str = Form(...),
    subject_id: int = Form(...),
    class_id: int = Form(...),
    external_link: str | None = Form(None),
    is_published: bool = Form(True),
    file: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Create a new learning resource, optionally with file upload."""
    try:
        file_path = None
        file_size = None
        content_type = None

        # Handle file upload
        if file and resource_type != "link":
            # Validate file type
            file_ext = file.filename.split(".")[-1].lower()
            if file_ext not in ALLOWED_FILE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type .{file_ext} not allowed. Allowed types: {', '.join(ALLOWED_FILE_TYPES.keys())}",
                )

            # Save file
            safe_filename = f"{datetime.utcnow().timestamp()}_{file.filename.replace(' ', '_')}"
            file_path = os.path.join(UPLOAD_DIRECTORY, safe_filename)

            with open(file_path, "wb") as buffer:
                contents = await file.read()
                buffer.write(contents)
                file_size = len(contents)

            content_type = file.content_type or ALLOWED_FILE_TYPES.get(file_ext, "application/octet-stream")

        # For link resources, validate external link
        if resource_type == "link" and not external_link:
            raise HTTPException(
                status_code=400,
                detail="external_link is required for link type resources",
            )

        new_resource = LearningResourceModel(
            title=title,
            description=description,
            resource_type=resource_type,
            category=category,
            subject_id=subject_id,
            class_id=class_id,
            file_path=file_path,
            external_link=external_link,
            file_size=file_size,
            content_type=content_type,
            is_published=is_published,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(new_resource)
        await db.commit()
        await db.refresh(new_resource)

        return LearningResourceResponse(**new_resource.__dict__)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print("CREATE RESOURCE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ DOWNLOAD RESOURCE FILE
@router.get("/{resource_id}/download")
async def download_resource(
    resource_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Download a learning resource file."""
    try:
        result = await db.execute(
            select(LearningResourceModel).where(LearningResourceModel.id == resource_id)
        )
        resource = result.scalar_one_or_none()

        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")

        if not resource.file_path or not os.path.exists(resource.file_path):
            raise HTTPException(
                status_code=404,
                detail="File not found. This might be a link-type resource.",
            )

        return FileResponse(
            path=resource.file_path,
            filename=resource.title,
            media_type=resource.content_type,
        )

    except HTTPException:
        raise
    except Exception as e:
        print("DOWNLOAD RESOURCE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
