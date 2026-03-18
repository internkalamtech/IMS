from abc import ABC, abstractmethod
from app.domain.entities.notice import Notice


class NoticeRepository(ABC):

    @abstractmethod
    async def create(self, notice: Notice) -> Notice:
        pass