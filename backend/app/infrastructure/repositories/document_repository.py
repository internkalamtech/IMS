"""
Document repository for handling database operations related to
compliance documents.
"""
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import DocumentModel


class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, document_data: dict) -> DocumentModel:
        """
        Create a new compliance document
        """
        document = DocumentModel(**document_data)
        self.db.add(document)
        await self.db.flush()
        return document

    async def get_by_id(self, document_id: int) -> DocumentModel | None:
        """
        Fetch document by ID
        """
        result = await self.db.execute(
            select(DocumentModel).where(DocumentModel.id == document_id)
        )
        return result.scalar_one_or_none()

    async def list_documents(
        self, branch: Optional[str] = None, scope: Optional[str] = None
    ) -> List[DocumentModel]:
        """
        List documents, optionally filtering by branch or scope
        """
        query = select(DocumentModel)

        if branch:
            query = query.where(DocumentModel.branch == branch)
        if scope:
            query = query.where(DocumentModel.scope == scope)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(
        self,
        document: DocumentModel,
        update_data: dict,
    ) -> DocumentModel:
        """
        Update an existing document.
        """
        for key, value in update_data.items():
            if value is not None:
                setattr(document, key, value)
        await self.db.flush()
        return document

    async def delete(self, document: DocumentModel) -> None:
        """
        Delete a document
        """
        await self.db.delete(document)
        await self.db.flush()
