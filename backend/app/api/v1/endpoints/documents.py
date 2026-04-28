from datetime import datetime
from typing import List, Optional
import os
import shutil

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import DocumentResponse
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.document_repository import (
    DocumentRepository,
)

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIRECTORY = "uploads/documents"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


def calculate_status_and_days_left(expiry_date: datetime) -> tuple[str, int]:
    """Helper to calculate document status and
    days left based on expiry_date."""
    now = datetime.utcnow()
    today = now.date()
    expiry = (
        expiry_date.date()
        if isinstance(expiry_date, datetime)
        else expiry_date
    )
    delta = (expiry - today).days

    if delta < 0:
        return "Expired", delta
    elif delta <= 30:
        return "Expiring-Soon", delta
    else:
        return "Valid", delta


@router.post(
    "/",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    title: str = Form(...),
    expiry_date: datetime = Form(...),
    branch: Optional[str] = Form(None),
    scope: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new compliance document with metadata."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided",
        )

    safe_filename = (
        f"{current_user.id}_{datetime.utcnow().timestamp()}_"
        f"{file.filename.replace(' ', '_')}"
    )
    file_path = os.path.join(
        UPLOAD_DIRECTORY,
        safe_filename,
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        user_id = int(current_user.id)
    except ValueError:
        user_id = None

    doc_data = {
        "title": title,
        "original_filename": file.filename,
        "file_path": file_path,
        "content_type": file.content_type or "application/octet-stream",
        "branch": branch,
        "scope": scope,
        "expiry_date": expiry_date,
        "uploaded_by_id": user_id,
        "upload_date": datetime.utcnow(),
    }

    repo = DocumentRepository(db)
    document = await repo.create(doc_data)
    await db.commit()
    await db.refresh(document)

    doc_status, days_left = (
        calculate_status_and_days_left(document.expiry_date)
    )

    response_data = {
        "id": document.id,
        "title": document.title,
        "branch": document.branch,
        "scope": document.scope,
        "expiry_date": document.expiry_date,
        "original_filename": document.original_filename,
        "content_type": document.content_type,
        "upload_date": document.upload_date,
        "uploaded_by_id": document.uploaded_by_id,
        "days_left": days_left,
        "status": doc_status,
    }

    return response_data


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    branch: Optional[str] = None,
    scope: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve filtered lists of documents based on branch
    or organizational scope.
    """
    repo = DocumentRepository(db)
    documents = await repo.list_documents(branch, scope)

    response_list = []
    for doc in documents:
        doc_status, days_left = calculate_status_and_days_left(doc.expiry_date)
        response_list.append({
            "id": doc.id,
            "title": doc.title,
            "branch": doc.branch,
            "scope": doc.scope,
            "expiry_date": doc.expiry_date,
            "original_filename": doc.original_filename,
            "content_type": doc.content_type,
            "upload_date": doc.upload_date,
            "uploaded_by_id": doc.uploaded_by_id,
            "days_left": days_left,
            "status": doc_status,
        })

    return response_list


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    title: Optional[str] = Form(None),
    expiry_date: Optional[datetime] = Form(None),
    branch: Optional[str] = Form(None),
    scope: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing compliance document."""
    repo = DocumentRepository(db)
    document = await repo.get_by_id(document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    update_data = {}
    if title is not None: update_data["title"] = title
    if expiry_date is not None: update_data["expiry_date"] = expiry_date
    if branch is not None: update_data["branch"] = branch
    if scope is not None: update_data["scope"] = scope
    
    if file and file.filename:
        safe_filename = f"{current_user.id}_{datetime.utcnow().timestamp()}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(UPLOAD_DIRECTORY, safe_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        update_data["original_filename"] = file.filename
        update_data["file_path"] = file_path
        update_data["content_type"] = file.content_type or "application/octet-stream"

    updated_doc = await repo.update(document, update_data)
    await db.commit()
    await db.refresh(updated_doc)

    doc_status, days_left = calculate_status_and_days_left(updated_doc.expiry_date)

    return {
        "id": updated_doc.id,
        "title": updated_doc.title,
        "branch": updated_doc.branch,
        "scope": updated_doc.scope,
        "expiry_date": updated_doc.expiry_date,
        "original_filename": updated_doc.original_filename,
        "content_type": updated_doc.content_type,
        "upload_date": updated_doc.upload_date,
        "uploaded_by_id": updated_doc.uploaded_by_id,
        "days_left": days_left,
        "status": doc_status,
    }

@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve and download stored document files securely."""
    repo = DocumentRepository(db)
    document = await repo.get_by_id(document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file missing from server",
        )

    return FileResponse(
        path=document.file_path,
        media_type=document.content_type,
        filename=document.original_filename,
    )
