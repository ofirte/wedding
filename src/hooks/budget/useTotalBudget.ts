import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define the type for total budget document
export interface TotalBudgetDoc {
  amount: number;
}

// Function to fetch total budget from Firestore
const fetchTotalBudget = async (): Promise<TotalBudgetDoc> => {
  const docRef = doc(db, "settings", "totalBudget");
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as TotalBudgetDoc;
  } else {
    // If no document exists, create one with a default value
    const defaultBudget: TotalBudgetDoc = { amount: 0 };
    await setDoc(docRef, defaultBudget);
    return defaultBudget;
  }
};

// Function to update total budget in Firestore
const updateTotalBudget = async (amount: number): Promise<void> => {
  const docRef = doc(db, "settings", "totalBudget");
  return setDoc(docRef, { amount });
};

// Hook for managing total budget
export const useTotalBudget = () => {
  const queryClient = useQueryClient();
  
  // Query to fetch the total budget
  const { data, isLoading, isError } = useQuery<TotalBudgetDoc>({
    queryKey: ["totalBudget"],
    queryFn: fetchTotalBudget,
  });

  // Mutation to update the total budget
  const { mutate: setTotalBudget } = useMutation({
    mutationFn: (newAmount: number) => updateTotalBudget(newAmount),
    onSuccess: () => {
      // Invalidate and refetch the total budget query
      queryClient.invalidateQueries({ queryKey: ["totalBudget"] });
    },
  });

  return {
    totalBudget: data?.amount || 0,
    setTotalBudget,
    isLoading,
    isError,
  };
};
