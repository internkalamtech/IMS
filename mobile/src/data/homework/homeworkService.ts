import axios from "axios";

// ✅ FIXED BASE URL (temporary direct URL)
const HOMEWORK_API = "http://127.0.0.1:8000/api/v1/homeworks";
const RESOURCES_API = "http://127.0.0.1:8000/api/v1/resources";

const homeworkClient = axios.create({
  baseURL: HOMEWORK_API,
});

const resourcesClient = axios.create({
  baseURL: RESOURCES_API,
});

// ========== HOMEWORK ENDPOINTS ==========

// ✅ GET ALL HOMEWORKS (for admin/teacher)
export const getHomeworks = async () => {
  try {
    const res = await homeworkClient.get("/");
    return res.data;
  } catch (error) {
    console.log("GET homeworks error:", error);
    return [];
  }
};

// ✅ GET HOMEWORK FOR SPECIFIC STUDENT
export const getStudentHomework = async (childId: number, filters: { status?: string; subject?: string } = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.subject) params.append("subject", filters.subject);

    const res = await homeworkClient.get(`/student/${childId}${params.toString() ? "?" + params.toString() : ""}`);
    return res.data;
  } catch (error) {
    console.log("GET student homework error:", error);
    return [];
  }
};

// ✅ GET SINGLE HOMEWORK
export const getHomeworkById = async (homeworkId: number) => {
  try {
    const res = await homeworkClient.get(`/${homeworkId}`);
    return res.data;
  } catch (error) {
    console.log("GET homework by ID error:", error);
    return null;
  }
};

// ✅ CREATE
export const createHomework = async (data: any) => {
  try {
    const res = await homeworkClient.post("/", data);
    return res.data;
  } catch (error) {
    console.log("POST error:", error);
    throw error;
  }
};

// ✅ UPDATE
export const updateHomework = async (id: string | number, data: any) => {
  try {
    const res = await homeworkClient.put(`/${id}`, data);
    return res.data;
  } catch (error) {
    console.log("PUT error:", error);
    throw error;
  }
};

// ✅ DELETE
export const deleteHomework = async (id: string | number) => {
  try {
    console.log("DELETE API CALL:", id);

    const res = await homeworkClient.delete(`/${id}`);

    console.log("DELETE SUCCESS:", res.data);

    return res.data;
  } catch (error) {
    console.log("DELETE error:", error);
    throw error;
  }
};

// ========== LEARNING RESOURCES ENDPOINTS ==========

// ✅ GET RESOURCES BY SUBJECT AND CLASS
export const getResourcesBySubject = async (
  subjectId: number,
  classId: number,
  category?: string
) => {
  try {
    const params = new URLSearchParams();
    params.append("class_id", classId.toString());
    if (category) params.append("category", category);

    const res = await resourcesClient.get(`/subject/${subjectId}?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.log("GET resources by subject error:", error);
    return [];
  }
};

// ✅ GET ALL RESOURCES FOR A STUDENT
export const getStudentResources = async (
  studentId: number,
  classId: number,
  resourceType?: string
) => {
  try {
    const params = new URLSearchParams();
    params.append("class_id", classId.toString());
    if (resourceType) params.append("resource_type", resourceType);

    const res = await resourcesClient.get(`/student/${studentId}?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.log("GET student resources error:", error);
    return [];
  }
};

// ✅ GET SINGLE RESOURCE
export const getResourceById = async (resourceId: number) => {
  try {
    const res = await resourcesClient.get(`/${resourceId}`);
    return res.data;
  } catch (error) {
    console.log("GET resource by ID error:", error);
    return null;
  }
};

// ✅ DOWNLOAD RESOURCE FILE
export const downloadResource = async (resourceId: number) => {
  try {
    const res = await resourcesClient.get(`/${resourceId}/download`, {
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    console.log("DOWNLOAD resource error:", error);
    throw error;
  }
};

// ✅ CREATE RESOURCE WITH FILE
export const createResource = async (formData: FormData) => {
  try {
    const res = await resourcesClient.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.log("CREATE resource error:", error);
    throw error;
  }
};