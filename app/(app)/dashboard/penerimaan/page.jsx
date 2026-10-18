"use client";

import React, { useEffect, useState, useRef } from "react";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import useCrud from "@/hooks/useCRUD";
import { useForm, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { SheetDescription } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faTrash,
  faPlus,
  faEye,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";
import nookies from "nookies";
import { jwtDecode } from "jwt-decode";
import Select from "react-select";
import logoReception from "../../../../public/images/TokoMarni.jpeg";
import Image from "next/image";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import numeral from "numeral";
import dynamic from "next/dynamic";

const Html2Pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

export default function Page({}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const {
    data: receptions,
    loading,
    error,
    token,
    fetchAllData,
    create,
    update,
    totalPages,
  } = useCrud("receptions");

  const { data: items, fetchAllData: getItems } = useCrud("items");

  const itemOptions = items?.map((row) => ({
    value: row.id,
    label: row.name,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const removeDetail = (index) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
    remove(index);
  };

  useEffect(() => {
    const token = nookies.get("token");

    if (token) {
      const decoded = jwtDecode(token.token);
      setRole(decoded.role);
      setName(decoded.name);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadData();
    getItems();
  }, [currentPage, search, token]);

  useEffect(() => {
    if (!token) return;
    setCurrentPage(1);
    loadData();
  }, [search]);

  useEffect(() => {
    reset(selectedData || {});
  }, [selectedData, reset]);

  const onSubmit = async (data) => {
    if (fields.length === 0) {
      toast({
        title: "Operation Failed!",
        description: "Details must have at least one item.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newData = {
        kode_po: data?.kode_po,
        date_po: new Date(data.date_po).toISOString(),
        items: data?.details.map((detail) => ({
          item_id: detail?.item_id,
          quantity: parseInt(detail?.qty, 10),
          price: parseInt(detail?.price, 10),
        })),
      };

      if (selectedData) {
        // Update logic is not present in the original, but keeping structure
        await update(selectedData.id, newData);
        toast({
          title: "Update Successful!",
          description: "Item reception data has been updated.",
          variant: "success",
        });
      } else {
        await create(newData);
        toast({
          title: "Creation Successful!",
          description: "A new item reception has been added to the list.",
          variant: "success",
        });
      }
      reset();
      setIsOpen(false);
    } catch (err) {
      toast({
        title: "Operation Failed!",
        description: "Something went wrong. Please check the form and try again.",
        variant: "destructive",
      });
    } finally {
      loadData();
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewDetails = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  function loadData() {
    fetchAllData({
      page: currentPage,
      search,
      perPage: itemsPerPage,
    });
  }

  const addDetail = (e) => {
    e.preventDefault();
    append({ item_id: "", price: "", qty: 1 });
  };

  const downloadPDF = async () => {
    const element = document.getElementById("receptions-details");
    const opt = {
      margin: 0.5,
      filename: `reception-${selectedRow?.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().from(element).set(opt).save();
  };

  const handleCancel = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    reset();
    setIsConfirmOpen(false);
    setIsOpen(false);
    reset();
  };

  return (
      !isClient ? (
        <div className="bg-slate-50 w-full min-h-screen py-24 antialiased">
          <div className="container mx-auto px-4 flex items-center justify-center h-[calc(100vh-6rem)]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        </div>
      ) : (
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
                Item Receptions Management
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Admin only section removed - single outlet */}
              <Button
                className="h-11 px-5 inline-flex items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-all font-semibold gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-px"
                onClick={() => {
                  setSelectedData(null);
                  reset({});
                  setIsOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Reception
              </Button>
            </div>
          </div>

          <div className="mb-6 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="w-full max-w-sm bg-slate-100 border-transparent rounded-lg h-11 text-base pl-11 pr-4 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-sky-500 transition"
              placeholder="Search by Receipt or Order Number..."
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
                    Receipt Number
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order Number
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Receipt Date
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order Date
                  </TableHead>
                  <TableHead className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receptions?.map((data, index) => (
                  <TableRow
                    key={data.id}
                    className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors [&:nth-child(even)]:bg-slate-50/50"
                  >
                    <TableCell className="p-4 text-center font-medium text-slate-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="p-4 text-slate-500 font-mono text-xs">{data.id}</TableCell>
                    <TableCell className="p-4 text-slate-800 font-medium">{data.kode_po}</TableCell>
                    <TableCell className="p-4 text-slate-600">
                      {moment(data.created_at).format("DD MMM YYYY - HH:mm:ss")}
                    </TableCell>
                    <TableCell className="p-4 text-slate-600">{data.user?.name}</TableCell>
                    <TableCell className="p-4 text-slate-600">{moment(data.date_po).format("DD MMM YYYY")}</TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 flex items-center justify-center rounded-md bg-sky-100 text-sky-600 hover:bg-sky-200 hover:text-sky-700 transition-all"
                          onClick={() => handleViewDetails(data)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {receptions?.length <= 0 && (
              <div className="w-full flex flex-col justify-center h-96 items-center text-slate-500 bg-slate-50/30">
                <img
                  src="/images/empty.png"
                  alt="No data"
                  className="w-40 h-40 opacity-60 mb-4"
                />
                <p className="text-xl font-semibold">No Receptions Found</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your search or filters to find what you&apos;re
                  looking for.
                </p>
              </div>
            )}
          </div>
          {receptions?.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={10}
                totalItemsInCurrentPage={receptions?.length}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideCloseButton={true}
          onInteractOutside={(event) => event.preventDefault()}
          className="w-full max-w-[90vw] sm:max-w-[80vw] lg:max-w-[60vw] max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {selectedData ? "Update Item Reception" : "Add New Item Reception"}
            </DialogTitle>
            <DialogDescription>
              Please fill in the form below. Required fields are marked with an
              asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* Left side */}
                <div className="flex flex-col gap-4">
                  <div>
                    <Label className="font-medium text-slate-700">User</Label>
                    <p className="text-base font-semibold text-slate-800 pt-1">{name}</p>
                  </div>

                  <div>
                    <Label htmlFor="kode_po" className="font-medium text-slate-700">
                      Order Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="kode_po"
                      className="h-11 mt-1"
                      placeholder="e.g., PO-12345"
                      {...register("kode_po", { required: "Order Number is required" })}
                    />
                    {errors.kode_po && (
                      <small className="text-red-500">{errors.kode_po.message}</small>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col gap-4">
                  <div>
                    <Label className="font-medium text-slate-700">Goods Receipt Date</Label>
                    <p className="text-base font-semibold text-slate-800 pt-1">
                      {moment(Date.now()).format("DD MMM YYYY - HH:mm:ss")}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="date_po" className="font-medium text-slate-700">
                      Order Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date_po"
                      type="date"
                      className="h-11 mt-1"
                      {...register("date_po", { required: "Order Date is required" })}
                    />
                    {errors.date_po && (
                      <small className="text-red-500">{errors.date_po.message}</small>
                    )}
                  </div>
                </div>

                {/* Outlet - auto-set to single outlet */}
                <div className="sm:col-span-2">
                  <input
                    type="hidden"
                    {...register("user_id")}
                    value={jwtDecode(nookies.get("token").token).userToken}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="font-bold text-lg tracking-wide text-slate-800">Detail Items</Label>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDetail}
                    className="mt-2 mb-4"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Item
                  </Button>
                </div>
                <div className={`border rounded-lg ${fields.length > 5 ? 'max-h-[250px] overflow-y-auto' : ''}`}>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase">No.</th>
                        <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase w-2/5">Item</th>
                        <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase">Purchase Price</th>
                        <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase">Quantity</th>
                        <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id} className="border-t">
                          <td className="p-2 font-medium">{index + 1}</td>
                          <td className="p-2">
                            <Select
                              id={`details.${index}.item_id`}
                              options={itemOptions.filter(
                                (option) => !selectedItems.includes(option.value)
                              )}
                              onChange={(selectedOption) => {
                                const newSelectedItems = [...selectedItems];
                                newSelectedItems[index] = selectedOption.value;
                                setSelectedItems(newSelectedItems);
                                setValue(`details.${index}.item_id`, selectedOption.value, { shouldValidate: true });
                              }}
                              placeholder="Select Item"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              className="h-10"
                              placeholder="e.g., 5000"
                              {...register(`details.${index}.price`, {
                                required: "Price is required",
                                min: { value: 0, message: "Min 0" },
                              })}
                            />
                            {errors.details?.[index]?.price && (
                              <small className="text-red-500">{errors.details[index].price.message}</small>
                            )}
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              className="h-10"
                              {...register(`details.${index}.qty`, {
                                required: "Qty is required",
                                min: { value: 1, message: "Min 1" },
                              })}
                            />
                            {errors.details?.[index]?.qty && (
                              <small className="text-red-500">{errors.details[index].qty.message}</small>
                            )}
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-9 w-9 p-0 flex items-center justify-center rounded-md bg-rose-100 text-rose-600 hover:bg-rose-200 hover:text-rose-700 transition-all"
                              onClick={() => removeDetail(index)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter className="mt-6 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-sky-600 hover:bg-sky-700 min-w-[120px]"
                  type="submit"
                  disabled={loading}
                >
                   {loading ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : selectedData ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">
                Confirm Exit
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-2">
                Are you sure you want to exit? Your unsaved changes will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
              >
                No
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancel}>
                Yes, Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {selectedRow && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-full sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
            <div id="receptions-details" className="p-4">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#4F6A6A]">
                    Goods Receipt
                  </h2>
                  <p className="text-sm text-slate-500">
                    Receipt number : {selectedRow.id}
                  </p>
                  <p className="text-sm text-slate-500">
                    Receipt date :{" "}
                    {moment(selectedRow.created_at).format(
                      "DD MMM YYYY - HH:mm:ss"
                    )}
                  </p>
                </div>
                <div className="flex items-center">
                  <Image
                    src={logoReception}
                    alt="Logo"
                    className="w-24 h-auto object-contain"
                  />
                </div>
              </div>

              <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-x-8 gap-y-2">
                <p><strong>No. Order:</strong> {selectedRow.kode_po}</p>
                <p><strong>Cashier Name:</strong> {selectedRow.user?.name}</p>
                <p><strong>Order date:</strong> {moment(selectedRow.date_po).format("DD MMM YYYY")}</p>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100/80">
                    <tr>
                      <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase">No.</th>
                      <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase">Item</th>
                      <th className="p-2 text-left text-xs font-semibold text-slate-600 uppercase">Unit</th>
                      <th className="p-2 text-right text-xs font-semibold text-slate-600 uppercase">Quantity</th>
                      <th className="p-2 text-right text-xs font-semibold text-slate-600 uppercase">Unit Price</th>
                      <th className="p-2 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRow.item_reception_details.map((item, index) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2 font-medium">{item.item?.name}</td>
                        <td className="p-2">{item.item?.unit}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">Rp {numeral(item.price).format("0,0")}</td>
                        <td className="p-2 text-right font-semibold">Rp {numeral(item.quantity * item.price).format("0,0")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <DialogFooter className="flex justify-center mt-4">
              <Button
                onClick={downloadPDF}
                className="bg-sky-600 hover:bg-sky-700"
              >
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
</Dialog>
      )}
    </div>
  )
);
}