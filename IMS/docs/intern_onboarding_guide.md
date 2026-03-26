# Intern Onboarding: Building Your First Feature

This guide takes you through the step-by-step process of adding a real feature (the **Notice Board**) to the IMS project. It explains exactly which files you need to touch and why.

---

## 1. The Full-Stack Flow (Example: Notice Board)

Imagine you want to add a feature where an Admin can post a "Notice" and a Student can view it. Here is the path your code takes:

### Step 0: The "Handshake" (Pydantic Schemas)

Before you write any logic, you must define what the data looks like coming in from the mobile app.
- **File**: `app/api/schemas.py`
- **Action**: Add a `NoticeCreate` class.
    ```python
    class NoticeCreate(BaseModel):
        title: str
        content: str
    ```

### Step 1: Define the Backend Storage (Infrastructure & Domain)

1.  **Database Model**: Add a `NoticeModel` in `app/infrastructure/database/models.py`.
    ```python
    class NoticeModel(Base):
        __tablename__ = "notices"
        id = Column(Integer, primary_key=True)
        title = Column(String, nullable=False)
        content = Column(Text)
    ```
2.  **Entity**: Create a simple Python class in `app/domain/entities/notice.py`. This is used by your business logic.
3.  **Repository Contract**: Create `NoticeRepository` in `app/domain/repositories/notice_repository.py`. It's an abstract class:
    ```python
    class NoticeRepository(ABC):
        @abstractmethod
        async def create(self, notice: Notice) -> Notice: ...
    ```

### Step 2: Implement the Logic (Implementation & UseCase)

1.  **Repo Implementation**: In `app/infrastructure/repositories/db_notice_repository.py`, write the actual SQL/SQLAlchemy code to save the notice.
2.  **UseCase**: In `app/domain/usecases/create_notice_usecase.py`, write the rules (e.g., "Title cannot be empty").
    ```python
    class CreateNoticeUseCase:
        def __init__(self, repo: NoticeRepository):
            self.repo = repo
        async def execute(self, title: str, content: str):
            if not title: raise ValueError("Title is required")
            return await self.repo.create(Notice(title=title, content=content))
    ```

### Step 3: Expose the API (FastAPI Route Handlers)

1.  **Endpoint**: Create `app/api/v1/endpoints/notices.py`. Define your URL here.
    ```python
    @router.post("/")
    async def create_notice(data: NoticeCreate):  # Uses the schema from Step 0
        return await CreateNoticeUseCase(repo).execute(data.title, data.content)
    ```
2.  **Register the Router (APIRouter Aggregation)**: Add your new endpoints to the main v1 router in `app/api/v1/router.py`.
    ```python
    from app.api.v1.endpoints import notices
    router.include_router(notices.router, prefix="/notices", tags=["Notices"])
    ```

---

## 2. The Mobile Connection (React Native)

Now that the backend is ready, here is how you build the UI:

1.  **Data Layer**: Create `src/data/repositories/NoticeRepositoryImpl.ts`. This file uses the `api` (from `core/api-client.ts`) to call `POST /notices`.
2.  **ViewModel (Hook)**: Create `src/presentation/hooks/useNoticeBoard.ts`.
    ```typescript
    export const useNoticeBoard = () => {
        const [loading, setLoading] = useState(false);
        const postNotice = async (title: string, content: string) => {
            // calls the repository implementation
        };
        return { postNotice, loading };
    };
    ```
3.  **UI Page**: Create `src/presentation/screens/NoticeBoardScreen.tsx` for the layout, and register it in `src/app/(tabs)/notices.tsx` to handle the navigation URL.

---

## 3. How to Simplify Your Work

If you feel overwhelmed by the number of files, follow these rules:

- **Rule 1: Use Scaffolding**. Never start from a blank file. Copy `auth.py` (Backend) or `useAuth.ts` (Mobile) and rename the parts. 80% of the structure is identical between features.
- **Rule 2: Don't Over-Layer**. If you are just fetching a simple list (like "About Us") that never changes, you can bypass the `UseCase` and call the `Repository` or `Api` directly in your component/router.
- **Rule 3: Trust the Schemas**. Spend 5 minutes getting your Pydantic schemas (Backend) and TypeScript Interfaces (Mobile) right. If your data types are correct, the rest of the code will practically write itself.

---

## 4. Where is everything? (The "Look Here" Cheat Sheet)

- **"I want to change the URL of an API"** -> Look in `app/api/v1/endpoints/`.
- **"I want to change the database table"** -> Look in `app/infrastructure/database/models.py`.
- **"I want to change a Button's color"** -> Look in `mobile/src/core/theme/tokens.ts`.
- **"I want to add a new screen"** -> Add a file in `mobile/src/app/` and a component in `mobile/src/presentation/screens/`.
- **"I can't log in"** -> Check `mobile/src/core/api-client.ts` to see how the token is being sent.
