"use client";

import useCrud from "@/hooks/useCRUD";
import { Input } from "../ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { MdClose, MdSearch } from "react-icons/md";
import { Button } from "../ui/button";

const ItemHeader = ({ setSearchItem, search, setSearch }) => {
  const router = useRouter();
  const inputRef = useRef();
  const {
    token,
    fetchAllData: fetchItems,
    data: items,
    loading,
  } = useCrud("items");
  const { fetchAllData: getOrderOnHold, data: orderOnHold } =
    useCrud(`orders/hold`);

  const params = useParams();

  const [selectedOrder, setSetselectedOrder] = useState(params.id || "");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const searchItems = useCallback(async () => {
    if (!search.trim()) return;
    try {
      await fetchItems({ search });
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }, [search]);

  useEffect(() => {
    setSearchItem(items);
  }, [items]);

  useEffect(() => {
    const timer = setTimeout(searchItems, 500);

    return () => clearTimeout(timer);
  }, [search, searchItems]);

  useEffect(() => {
    getOrderOnHold();
  }, []);

  useEffect(() => {
    selectedOrder && router.push(`/dashboard/pos/${selectedOrder}`);
  }, [selectedOrder]);

  return (
    <>
      {orderOnHold?.length > 0 && (
        <div className="">
          <h1 className="text-lg font-semibold">Transaction Number</h1>
          <select
            name="transasction_id"
            id=""
            className="border p-2 rounded-lg mt-4 w-full h-[2.5rem] focus:ring-0 text-sm capitalize"
            value={selectedOrder}
            onChange={(e) => setSetselectedOrder(e.target.value)}
          >
            {orderOnHold?.map((row) => {
              return (
                <option value={row.id} key={row.id}>
                  {row.public_id} - {moment(row.created_at).fromNow()}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="flex gap-2 mt-3 relative">
        <Input
          ref={inputRef}
          onChange={handleSearch}
          value={search}
          className={`relative w-full h-[2.5rem]`}
          placeholder={"Search for items"}
        />
        <div
          className={`rounded-lg bg-rose-500 p-1 text-white text-2xl absolute right-1 mt-1 transition-all duration-500 cursor-pointer ${
            search ? "opacity-100 z-50" : "opacity-0"
          }`}
          onClick={() => setSearch("")}
        >
          <MdClose></MdClose>
        </div>
        <div
          className={`rounded-lg bg-none p-1 text-slate-400 text-2xl absolute right-1 mt-1 transition-all duration-500 cursor-pointer ${
            !search ? "opacity-100 z-50" : "opacity-0"
          }`}
          onClick={() => {
            inputRef.current.focus();
          }}
        >
          <MdSearch></MdSearch>
        </div>
        {loading && (
          <div
            className={`rounded-lg bg-none text-slate-400 text-2xl absolute right-10 mt-1 transition-all duration-500 cursor-pointer`}
          >
            <div className="flex w-full items-center justify-center opacity-25">
              <img src="/images/loader.gif" alt="" className="w-8" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default ItemHeader;
