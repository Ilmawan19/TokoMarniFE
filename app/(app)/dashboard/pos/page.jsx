"use client";

import useCrud from "@/hooks/useCRUD";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Pos = () => {
  const { create, token } = useCrud("orders");
  const router = useRouter();
  const [userInformation, setUserInformation] = useState({
    user_id: null,
  });

  const createOrder = async () => {
    try {
      const response = await create(userInformation);
      router.push(`/dashboard/pos/${response.data?.id}`);
    } catch (error) {
      console.error("error create order");
    }
  };

  useEffect(() => {
    if (!token) return;
    const decoded = jwtDecode(token);
    setUserInformation((prev) => {
      return {
        ...prev,
        user_id: decoded.userToken,
      };
    });
  }, [token]);

  useEffect(() => {
    if (userInformation.user_id) {
      createOrder();
    }
  }, [userInformation]);

  return (
    <div className="flex h-screen w-screen items-center justify-center flex-col gap-4 bg-slate-50 text-slate-700 antialiased">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
      <h1 className="text-2xl font-semibold tracking-tight mt-4">
        Creating New Order
      </h1>
      <p className="text-slate-500">Please wait a moment...</p>
    </div>
  );
};

export default Pos;