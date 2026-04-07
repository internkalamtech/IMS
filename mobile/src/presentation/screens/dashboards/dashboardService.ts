import axios from "axios";

const API = "http://10.0.2.2:8000/api/v1"; // ⚠️ Android emulator

export const getDashboardStats = async () => {
  const res = await axios.get(`${API}/homeworks?teacherId=T1`);
  const homeworks = res.data;

  const classCount: any = {};

  homeworks.forEach((hw: any) => {
    if (hw.className) {
      classCount[hw.className] =
        (classCount[hw.className] || 0) + 1;
    }
  });

  return Object.keys(classCount).map((cls) => ({
    label: `Homework (${cls})`,
    value: classCount[cls],
  }));
};