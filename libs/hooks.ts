"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

export const useCurrentRole = () => {
  const session = useSession();
  return session.data?.user.role;
};

export const useCurrentUser = () => {
  console.log("FETCHING useCurrentUser")
  const session = useSession();

  console.log("SESSION: ", session);

  console.log("END useCurrentUser")
  return session?.data?.user;
};
