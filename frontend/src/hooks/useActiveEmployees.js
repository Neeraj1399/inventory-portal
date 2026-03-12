import { useState, useEffect } from "react";
import api from "../hooks/api";

export const useActiveEmployees = (isOpen) => {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    if (!isOpen) return;
    api
      .get("/employees?status=ACTIVE")
      .then((res) => setEmployees(res.data.data))
      .catch((err) => console.error(err));
  }, [isOpen]);
  return employees;
};
