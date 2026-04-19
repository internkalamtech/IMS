import { ApiClient } from "@/core/api-client";

/* TYPES */
export interface TeacherDashboardData {
  teacher: {
    id?: number;
    name: string;
    subject: string;
    className: string;
  };

  stats: {
    totalStudents: number;
    presentStudents: number;
  };

  recentUpdates: {
    id: number;
    title: string;
    description?: string;
    createdAt?: string;
  }[];
}

/* REPO */
export class Teacher2DashboardRepositoryImpl {
  private api = ApiClient.getInstance().getAxios();

  async getDashboardData(): Promise<TeacherDashboardData> {
    try {
      const res = await this.api.get("/teacher/dashboard"); // ✅ ONE API
      return res.data;
    } catch (error) {
      console.error("Dashboard fetch error:", error);

      // fallback (prevents crash)
      return {
        teacher: {
          name: "",
          subject: "",
          className: "",
        },
        stats: {
          totalStudents: 0,
          presentStudents: 0,
        },
        recentUpdates: [],
      };
    }
  }
}