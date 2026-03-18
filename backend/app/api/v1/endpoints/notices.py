from IMS.backend.app.api.schemas import NoticeCreate
from IMS.backend.app.api.v1 import router
from IMS.backend.app.domain.usecases.notice_usecase import CreateNoticeUseCase
from app.infrastructure.repositories.db_notice_repository import DBNoticeRepository

repo = DBNoticeRepository()

@router.post("/")
async def create_notice(data: NoticeCreate):  # Uses the schema from Step 0
        return await CreateNoticeUseCase(repo).execute(data.title, data.content)