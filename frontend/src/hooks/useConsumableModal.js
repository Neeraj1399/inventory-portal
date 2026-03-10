import { useState, useEffect } from "react";
import api from "../hooks/api";

export const useConsumableModal = (isOpen, item) => {
  const [employeeId, setEmployeeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setEmployeeId("");
      setQuantity(1);

      api
        .get("/employees?status=ACTIVE")
        .then((res) => setEmployees(res.data.data))
        .catch((err) => console.error("Failed to load employees", err));
    }
  }, [isOpen, item]);

  return {
    employeeId,
    setEmployeeId,
    quantity,
    setQuantity,
    loading,
    setLoading,
    employees,
  };
};
