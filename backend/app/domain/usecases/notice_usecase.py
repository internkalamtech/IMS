from app.domain.repositories.notice_repository import NoticeRepository
from app.domain.entities.notice import Notice
class CreateNoticeUseCase:
        def __init__(self, repo: NoticeRepository):
            self.repo = repo
        async def execute(self, title: str, content: str):
            if not title: raise ValueError("Title is required")
            return await self.repo.create(Notice(title=title, content=content))