"""
Use case for updating subjects of a class.
This use case allows updating the subjects associated with a class.
It checks if the class exists, then processes the provided subjects.
If a subject has an ID, it retrieves it from the database; if not,
it checks for an existing subject by name or creates a new one.
Finally, it updates the class's subjects and commits the changes
to the database.
"""

from app.core.errors import NotFoundError, ValidationError


class UpdateClassSubjectsUseCase:

    def __init__(self, class_repo, subject_repo, db):
        self.class_repo = class_repo
        self.subject_repo = subject_repo
        self.db = db

    async def execute(self, class_id: int, subjects: list):

        if not subjects:
            raise ValidationError("At least one subject is required")

        # 1️⃣ Get class (class_id=0 means use default/first class)
        if class_id == 0:
            class_obj = await self.class_repo.get_first()
        else:
            class_obj = await self.class_repo.get_by_id(class_id)

        if not class_obj:
            raise NotFoundError(f"Class with id {class_id} not found")

        subject_entities = []

        # 2️⃣ Process subjects
        for subject in subjects:

            # If ID is provided → existing subject
            if subject.get("id"):
                subject_obj = await self.subject_repo.get_by_id(subject["id"])

                if not subject_obj:
                    raise NotFoundError(
                        f"Subject with id {subject['id']} not found"
                    )

            # If name is provided → find or create
            else:
                if not subject.get("name"):
                    raise ValidationError("Subject name is required")

                subject_obj = await self.subject_repo.get_by_name(
                    subject["name"]
                    )

                if not subject_obj:
                    subject_obj = await self.subject_repo.create(
                        subject["name"]
                        )

            subject_entities.append(subject_obj)

        # 3️⃣ Update M2M relationship
        class_obj.subjects = subject_entities

        # 4️⃣ Save changes
        await self.db.commit()

        return {
            "message": "Class subjects updated successfully",
            "class_id": class_obj.id,
            "subjects_count": len(subject_entities),
        }
