import { useState, useRef } from "react";
import { useCreateLead } from "../../../hooks/leads";

export const useNewLeadInput = () => {
  const [newLeadName, setNewLeadName] = useState("");
  const newLeadInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const { mutate: createLead } = useCreateLead();

  const handleNewLeadKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newLeadName.trim()) {
      e.preventDefault();
      handleAddLead();
    } else if (e.key === "Escape") {
      setNewLeadName("");
    }
  };

  const handleAddLead = () => {
    if (newLeadName.trim()) {
      createLead({
        name: newLeadName.trim(),
        email: "",
        status: "new",
        source: "website",
        paymentStatus: "awaiting_payment",
      });
      setNewLeadName("");
    }
  };

  return {
    newLeadName,
    newLeadInputRef,
    setNewLeadName,
    handleNewLeadKeyDown,
    handleAddLead,
  };
};
