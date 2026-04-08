import { createUser } from "../../data/repositories/user-repository";

export const useUser = () => {
  const addUser = async (name: string, email: string) => {
    try {
      const data = await createUser(name, email);
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return { addUser };
};