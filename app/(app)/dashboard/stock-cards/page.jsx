"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useCrud from "@/hooks/useCRUD";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChartLine,
  faEye,
  faFileExcel,
  faSearch,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";
import numeral from "numeral";
import moment from "moment";
import * as XLSX from "xlsx";
import StockChart from "@/components/dashboard/StockChart";
import { jwtDecode } from "jwt-decode";

export default function Page() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const itemsPerPage = 10;

  const {
    data: cards,
    token,
    fetchAllData: getCards,
    loading: cardsLoading,
  } = useCrud("stock-cards");

  useEffect(() => {
    if (!token) return;
    const decoded = jwtDecode(token);
    setRole(decoded?.role);
  }, [token]);

  const {
    data: items,
    fetchAllData: getItems,
    totalPages: totalPagesItems,
  } = useCrud("items");

  const { reset } = useForm();

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [currentPage, search, token]);

  useEffect(() => {
    if (!token) return;
    setCurrentPage(1);
    loadData();
  }, [search]);

  useEffect(() => {
    if (selectedItem) {
      loadCards();
    }
  }, [selectedItem]);

  async function loadCards() {
    try {
      await getCards({
        item_id: selectedItem?.id || "",
        perPage: 9999,
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    reset(selectedData || {});
  }, [selectedData, reset]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  function loadData() {
    getItems({
      page: currentPage,
      perPage: itemsPerPage,
      search,
    });
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      cards.map((data, index) => ({
        No: index + 1,
        ID: data.id,
        Item: data.item?.name,
        "Stock IN": data.stock_in,
        "Stock OUT": data.stock_out,
        "Current Stock": data.current_stock,
        Type: data.transaction_type,
        Date: moment(data.created_at).format("DD MMM YYYY - HH:mm:ss"),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Data");

    XLSX.writeFile(workbook, `stock_data_${selectedItem?.name}.xlsx`);
  };

  return (
    <div className="bg-slate-50 w-full min-h-screen py-24 antialiased">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-slate-200/70 border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Button
                variant="ghost"
                className="group mb-2 text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-300 h-9 rounded-2xl flex items-center"
                onClick={() => router.push("/dashboard")}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1"
                />
                Back
              </Button>
              <h1 className="text-4xl font-bold tracking-tight text-slate-800">
                Stock Cards
              </h1>
            </div>

            </div>

          <div className="mb-6 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="w-full max-w-sm bg-slate-100 border-transparent rounded-lg h-11 text-base pl-11 pr-4 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-sky-500 transition"
              placeholder="Search by item name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-100/80">
                <TableRow>
                  <TableHead className="w-[60px] p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    No.
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Current Stock
                  </TableHead>
                  <TableHead className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((data, index) => (
                  <TableRow
                    key={data.id}
                    className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors [&:nth-child(even)]:bg-slate-50/50"
                  >
                    <TableCell className="p-4 text-center font-medium text-slate-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="p-4 text-slate-500 font-mono text-xs">
                      {data.id}
                    </TableCell>
                    <TableCell className="p-4 text-slate-800 font-medium">
                      {data.name}
                    </TableCell>
                    <TableCell className="p-4 text-slate-600 max-w-xs truncate">
                      {data.description}
                    </TableCell>
                    <TableCell className="p-4 font-semibold text-sky-700">
                      Rp {numeral(data.price).format("0,0")}
                    </TableCell>
                    <TableCell className="p-4 text-slate-800 font-semibold">
                      {numeral(data.stock).format("0,0")}
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 flex items-center justify-center rounded-md bg-sky-100 text-sky-600 hover:bg-sky-200 hover:text-sky-700 transition-all"
                          onClick={() => {
                            setSelectedItem(data);
                            setIsOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {items?.length <= 0 && (
              <div className="w-full flex flex-col justify-center h-96 items-center text-slate-500 bg-slate-50/30">
                <img
                  src="/images/empty.png"
                  alt="No data"
                  className="w-40 h-40 opacity-60 mb-4"
                />
                <p className="text-xl font-semibold">No Items Found</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your search or filters to find what you&apos;re
                  looking for.
                </p>
              </div>
            )}
          </div>
          {items?.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPagesItems}
                onPageChange={handlePageChange}
                itemsPerPage={10}
                totalItemsInCurrentPage={items?.length}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-6xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-1">
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>

          {cardsLoading ? (
            <div className="w-full flex items-center justify-center h-96">
              <img src="/images/loader.gif" alt="Loading..." className="w-32" />
            </div>
          ) : (
            <Tabs defaultValue="table" className="mt-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <TabsList>
                  <TabsTrigger value="table" className="gap-2">
                    <FontAwesomeIcon icon={faTable} /> Table View
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="gap-2">
                    <FontAwesomeIcon icon={faChartLine} /> Charts
                  </TabsTrigger>
                </TabsList>

                <div>
                  <Button
                    onClick={exportToExcel}
                    className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-semibold gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-px"
                  >
                    <FontAwesomeIcon icon={faFileExcel} />
                    Export
                  </Button>
                </div>
              </div>
              <TabsContent value="table" className="mt-4">
                <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200">
                  <Table className="relative">
<TableHeader className="bg-slate-100/80 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[60px] p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        No.
                      </TableHead>
                      <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        ID
                      </TableHead>
                      <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Item
                      </TableHead>
                      <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Stock IN
                      </TableHead>
                      <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Stock OUT
                      </TableHead>
                      <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Current Stock
                      </TableHead>
                      <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Type
                      </TableHead>
                      <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards?.map((data, index) => (
                      <TableRow
                        key={data.id}
                        className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors"
                      >
                        <TableCell className="p-4 text-center font-medium text-slate-700">
                          {index + 1}
                        </TableCell>
                        <TableCell className="p-4 font-mono text-xs text-slate-500">
                          {data.id}
                        </TableCell>
                        <TableCell className="p-4 text-slate-800 font-medium">
                          {data.item?.name}
                        </TableCell>
                        <TableCell
                          className={`p-4 font-semibold ${
                            data.stock_in !== 0
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-slate-400"
                          }`}
                        >
                          + {data.stock_in}
                        </TableCell>
                        <TableCell
                          className={`p-4 font-semibold ${
                            data.stock_out !== 0
                              ? "text-rose-600 bg-rose-50"
                              : "text-slate-400"
                          }`}
                        >
                          - {data.stock_out}
                        </TableCell>
                        <TableCell className="p-4 font-semibold text-slate-800">
                          {data.current_stock}
                        </TableCell>
                        <TableCell className="p-4 capitalize text-slate-600">
                          {data.transaction_type.replace("_", " ")}
                        </TableCell>
                        <TableCell className="p-4 text-slate-600 text-sm">
                          {moment(data.created_at).format(
                            "DD MMM YYYY, HH:mm"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="charts" className="w-full mt-4">
                <div className="h-[60vh] p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <StockChart cards={cards} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}