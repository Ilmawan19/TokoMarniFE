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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useCrud from "@/hooks/useCRUD";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faPlus,
  faSearch,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";
import { useToast } from "@/hooks/use-toast";
import numeral from "numeral";

export default function Page() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dataToDelete, setDataToDelete] = useState(null);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const itemsPerPage = 10;

  const {
    data: items,
    token,
    loading,
    error,
    errorReset,
    fetchAllData,
    create,
    update,
    remove,
    totalPages,
  } = useCrud("items");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

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
    reset(selectedData || {});
  }, [selectedData, reset]);

  const onSubmit = async (data) => {
    try {
      if (selectedData) {
        const newData = {
          name: data?.name,
          description: data?.description,
          price: parseInt(data?.price),
          unit: data?.unit,
          stock: data?.stock,
        };
        await update(selectedData.id, newData);
        toast({
          title: "Update Successful!",
          description: "Item data has been updated.",
          variant: "success",
        });
      } else {
        await create(data);
        toast({
          title: "Creation Successful!",
          description: "A new item has been added to the list.",
          variant: "success",
        });
      }
      reset();
      loadData();
      setIsOpen(false);
    } catch (err) {
      console.log(err);
      toast({
        title: "Operation Failed!",
        description: "Something went wrong. Please check the form and try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (dataToDelete) {
        await remove(dataToDelete.id);
        setDeleteWarningOpen(false);
        setDataToDelete(null);
      }
      toast({
        title: "Deletion Successful!",
        description: "The item has been permanently removed.",
        variant: "success",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Deletion Failed!",
        description: "Could not delete the item. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (item) => {
    setSelectedData(item);
    errorReset();
    setIsOpen(true);
  };

  function loadData() {
    fetchAllData({
      page: currentPage,
      perPage: itemsPerPage,
      search,
    });
  }

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
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1" />
                Back
              </Button>
              <h1 className="text-4xl font-bold tracking-tight text-slate-800">
                Items Management
              </h1>
            </div>

            <Button
              className="h-11 px-5 inline-flex items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-all font-semibold gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-px"
              onClick={() => {
                setSelectedData(null);
                reset({});
                errorReset();
                setIsOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Item
            </Button>
          </div>

          <div className="mb-6 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="w-full max-w-sm bg-slate-100 border-transparent rounded-lg h-11 text-base pl-11 pr-4 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-sky-500 transition"
              placeholder="Search by name, description..."
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
                    Unit
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stock
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
                    <TableCell className="p-4 text-slate-600">
                      {data.unit}
                    </TableCell>
                    <TableCell className="p-4 text-slate-800 font-semibold">
                      {numeral(data.stock).format("0,0")}
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 flex items-center justify-center rounded-md bg-sky-100 text-sky-600 hover:bg-sky-200 hover:text-sky-700 transition-all"
                          onClick={() => handleEdit(data)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 flex items-center justify-center rounded-md bg-rose-100 text-rose-600 hover:bg-rose-200 hover:text-rose-700 transition-all"
                          onClick={() => {
                            setDataToDelete(data);
                            setDeleteWarningOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
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
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={10}
                totalItemsInCurrentPage={items?.length}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteWarningOpen} onOpenChange={setDeleteWarningOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Are you sure you want to delete this item? This action is
              irreversible and will permanently remove the data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteWarningOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {selectedData ? "Edit Item Details" : "Add a New Item"}
            </DialogTitle>
            <DialogDescription>
              Please fill in the form below. Required fields are marked with an
              asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 pt-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="name"
                className="text-left font-medium text-slate-700"
              >
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Indomie"
                className="h-11"
                {...register("name", { required: true })}
              />
              {error?.name && (
                <small className="text-red-500">{error.name}</small>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="description"
                className="text-left font-medium text-slate-700"
              >
                Description
              </Label>
              <Input
                id="description"
                placeholder="e.g., Pain relief and fever reducer"
                className="h-11"
                {...register("description", { required: false })}
              />
              {error?.description && (
                <small className="text-red-500">{error.description}</small>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="price"
                  className="text-left font-medium text-slate-700"
                >
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 5000"
                  className="h-11"
                  {...register("price", {
                    required: true,
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be greater than 0" },
                  })}
                />
                {error?.price && (
                  <small className="text-red-500">{error.price}</small>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="unit"
                  className="text-left font-medium text-slate-700"
                >
                  Unit <span className="text-red-500">*</span>
                </Label>
                <select
                  id="unit"
                  className="h-11 border border-input bg-background rounded-md px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("unit", { required: true })}
                >
                  <option value="">Pilih satuan...</option>
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="liter">Liter</option>
                  <option value="bungkus">Bungkus</option>
                  <option value="botol">Botol</option>
                  <option value="sachet">Sachet</option>
                </select>
                {error?.unit && (
                  <small className="text-red-500">{error.unit}</small>
                )}
              </div>
            </div>

            {!selectedData && (
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="stock"
                  className="text-left font-medium text-slate-700"
                >
                  Initial Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="e.g., 100"
                  className="h-11"
                  {...register("stock", {
                    required: true,
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                  })}
                />
                {error?.stock && (
                  <small className="text-red-500">{error.stock}</small>
                )}
              </div>
            )}

            <DialogFooter className="mt-4 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  reset();
                  setIsOpen(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 min-w-[120px]"
                disabled={loading}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : selectedData ? (
                  "Update Changes"
                ) : (
                  "Save Item"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}