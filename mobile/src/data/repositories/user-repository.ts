import { api } from "../../core/api-client"; 

export const createUser = async (name: string, email: string) => {
  const response = await api.post("/users", { 
    name,
    email,
  });
  return response.data;
};