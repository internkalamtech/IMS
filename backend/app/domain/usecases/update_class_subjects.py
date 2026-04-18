"""
Use case for updating subjects of a class.
This use case allows updating the subjects associated with a class.
It checks if the class exists, then processes the provided subjects.
If a subject has an ID, it retrieves it from the database; if not,
it checks for an existing subject by name or creates a new one.
Finally, it updates the class's subjects and commits the changes
to the database.
"""


class UpdateClassSubjectsUseCase:

    def __init__(self, class_repo, subject_repo, db):
        self.class_repo = class_repo
        self.subject_repo = subject_repo
        self.db = db

    async def execute(self, class_id: int, subjects: list):

        # 1️⃣ Get class
        class_obj = await self.class_repo.get_by_id(class_id)

        if not class_obj:
            raise Exception("Class not found")

        subject_entities = []

        # 2️⃣ Process subjects
        for subject in subjects:

            # If ID is provided → existing subject
            if subject.get("id"):
                subject_obj = await self.subject_repo.get_by_id(subject["id"])

                if not subject_obj:
<<<<<<< HEAD
                    raise Exception(f"Subject with id {subject['id']} not found")

            # If name is provided → find or create
            else:
                subject_obj = await self.subject_repo.get_by_name(subject["name"])

                if not subject_obj:
                    subject_obj = await self.subject_repo.create(subject["name"])
=======
                    raise Exception(
                        f"Subject with id {subject['id']} not found"
                    )

            # If name is provided → find or create
            else:
                subject_obj = await self.subject_repo.get_by_name(
                    subject["name"]
                )

                if not subject_obj:
                    subject_obj = await self.subject_repo.create(
                        subject["name"]
                    )
>>>>>>> 57e362124b6e97fdef8de061d0f42b2d20ed09dc

            subject_entities.append(subject_obj)

        # 3️⃣ Update M2M relationship
        class_obj.subjects = subject_entities

        # 4️⃣ Save changes
        await self.db.commit()

        return {
            "message": "Class subjects updated successfully",
            "class_id": class_id,
            "subjects_count": len(subject_entities),
        }
