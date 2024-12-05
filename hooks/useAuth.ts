import { useContext } from "react";
import { AuthContext } from "~context/AuthContext";

// Custom hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);