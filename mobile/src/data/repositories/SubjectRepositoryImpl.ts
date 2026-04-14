import { ApiClient } from "@/core/api-client";

export class SubjectRepositoryImpl {
  private api = ApiClient.getInstance().getAxios();

  async getAvailableSubjects() {
  const res = await this.api.get("/subjects"); // ✅ FIX
  return res.data;
}

  async updateClassSubjects(classId: number, subjects: any[]) {
    const payload = subjects.map((s) =>
      s.id ? { id: s.id } : { name: s.name },
    );

    return this.api.post("/class/subjects", {
      // ✅ NO /api/v1
      class_id: classId,
      subjects: payload,
    });
  }
}
