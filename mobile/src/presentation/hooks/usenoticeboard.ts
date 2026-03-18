
import { useState } from "react";
export const useNoticeBoard = () => {
        const [loading, setLoading] = useState(false);
        const postNotice = async (title: string, content: string) => {
            // calls the repository implementation
        };
        return { postNotice, loading };
    };
    