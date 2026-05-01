import { api } from '@/core/api-client';

// ✅ GET
export const getHomeworks = async () => {
  try {
    const res = await api.get('/homeworks/');
    return res.data;
  } catch (error) {
    console.log("GET error:", error);
    return [];
  }
};

// ✅ CREATE
export const createHomework = async (data: any) => {
  try {
    const res = await api.post('/homeworks/', data);
    return res.data;
  } catch (error) {
    console.log("POST error:", error);
    throw error;
  }
};

// ✅ UPDATE
export const updateHomework = async (id: string, data: any) => {
  try {
    const res = await api.put(`/homeworks/${id}`, data);
    return res.data;
  } catch (error) {
    console.log("PUT error:", error);
    throw error;
  }
};

// ✅ DELETE
export const deleteHomework = async (id: string) => {
  try {
    console.log("DELETE API CALL:", id);

    const res = await api.delete(`/homeworks/${id}`);

    console.log("DELETE SUCCESS:", res.data);

    return res.data;
  } catch (error: any) {
    console.log(
      "DELETE ERROR:",
      error?.response?.status,
      error?.response?.data || error.message
    );
    throw error;
  }
};