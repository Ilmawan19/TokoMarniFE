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

export default function Page() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("created_at:desc");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [dataToDelete, setDataToDelete] = useState(null);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const {
    data: users,
    error: usersError,
    loading,
    fetchAllData: fetchAllUserData,
    create: createUserData,
    update: updateUserData,
    remove: removeUserData,
    errorReset,
    token,
    totalPages,
  } = useCrud("users");

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [currentPage, search, sortBy, token]);
  
  useEffect(() => {
    if (!token) return;
    setCurrentPage(1);
    loadData();
  }, [search, sortBy]);

  useEffect(() => {
    reset(selectedData || {});
  }, [selectedData, reset]);

  function loadData() {
    fetchAllUserData({
      page: currentPage,
      search,
      sortBy,
      perPage: itemsPerPage,
    });
  }

  const onSubmit = async (data) => {
    try {
      if (selectedData) {
        // Hapus field password jika kosong saat update
        const updateData = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUserData(selectedData.id, updateData);
        toast({
          title: "Update Successful!",
          description: "User data has been updated.",
          variant: "success",
        });
      } else {
        await createUserData(data);
        toast({
          title: "Creation Successful!",
          description: "A new user has been added to the list.",
          variant: "success",
        });
      }
      setIsOpen(false);
      reset();
      loadData();
    } catch (error) {
       toast({
        title: "Operation Failed!",
        description: "Something went wrong. Please check the form and try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await removeUserData(dataToDelete.id);
      toast({
        title: "Deletion Successful!",
        description: "The user has been permanently removed.",
        variant: "success",
      });
      setDeleteWarningOpen(false);
      setDataToDelete(null);
      loadData();
    } catch (error) {
       toast({
        title: "Deletion Failed!",
        description: "Could not delete the user. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  const handleEdit = (user) => {
    setSelectedData(user);
    errorReset();
    setIsOpen(true);
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
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1" />
                Back
              </Button>
              <h1 className="text-4xl font-bold tracking-tight text-slate-800">
                Users Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                <select
                  id="sort-options"
                  className="h-11 appearance-none border border-slate-300 rounded-lg w-full sm:w-48 text-sm py-1 pl-4 pr-10 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created_at:desc">Newest First</option>
                  <option value="created_at:asc">Oldest First</option>
                  <option value="name:asc">Name (A-Z)</option>
                  <option value="name:desc">Name (Z-A)</option>
                </select>
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
                Add User
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
              placeholder="Search by name, email..."
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
                    Name
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="p-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors [&:nth-child(even)]:bg-slate-50/50"
                  >
                    <TableCell className="p-4 text-center font-medium text-slate-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="p-4 text-slate-800 font-semibold">{row.name}</TableCell>
                    <TableCell className="p-4 text-slate-600">{row.email}</TableCell>
                    <TableCell className="p-4 text-slate-600">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        row.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 
                        row.role === 'KASIR' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {row.role}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                           variant="ghost"
                           className="h-9 w-9 p-0 flex items-center justify-center rounded-md bg-sky-100 text-sky-600 hover:bg-sky-200 hover:text-sky-700 transition-all"
                           onClick={() => handleEdit(row)}
                         >
                           <FontAwesomeIcon icon={faEdit} />
                         </Button>
                         <Button
                           variant="ghost"
                           className="h-9 w-9 p-0 flex items-center justify-center rounded-md bg-rose-100 text-rose-600 hover:bg-rose-200 hover:text-rose-700 transition-all"
                           onClick={() => {
                             setDataToDelete(row);
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
            {users?.length <= 0 && (
              <div className="w-full flex flex-col justify-center h-96 items-center text-slate-500 bg-slate-50/30">
                 <img
                  src="/images/empty.png"
                  alt="No data"
                  className="w-40 h-40 opacity-60 mb-4"
                />
                <p className="text-xl font-semibold">No Users Found</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
              </div>
            )}
          </div>
           {users?.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItemsInCurrentPage={users.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteWarningOpen} onOpenChange={setDeleteWarningOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Are you sure you want to delete this user? This action is irreversible and will permanently remove the data.
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

      {/* Create & Update Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {selectedData ? "Edit User Details" : "Add a New User"}
            </DialogTitle>
            <DialogDescription>
               Please fill in the form below. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-6 pt-4"
          >
            <div className="flex flex-col gap-2">
                <Label htmlFor="role" className="text-left font-medium text-slate-700">Role <span className="text-red-500">*</span></Label>
                <select
                    id="role"
                    className="h-11 border border-input bg-background rounded-md px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("role", { required: true })}
                >
                    <option value="">Select a role...</option>
                    <option value="KASIR">KASIR</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                {usersError?.role && <small className="text-red-500">{usersError.role}</small>}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-left font-medium text-slate-700">Full Name <span className="text-red-500">*</span></Label>
                <Input
                    id="name"
                    placeholder="e.g., John Doe"
                    className="h-11"
                    {...register("name", { required: true })}
                />
                {usersError?.name && <small className="text-red-500">{usersError.name}</small>}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-left font-medium text-slate-700">Email Address <span className="text-red-500">*</span></Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="e.g., john.doe@gmail.com"
                    className="h-11"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@gmail\.com$/i,
                        message: "Email harus menggunakan @gmail.com",
                      },
                    })}
                />
                {errors.email && <small className="text-red-500">{errors.email.message}</small>}
                {usersError?.email && <small className="text-red-500">{usersError.email}</small>}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-left font-medium text-slate-700">
                  Password {selectedData ? "(Leave blank to keep unchanged)" : <span className="text-red-500">*</span>}
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password"
                    className="h-11"
                    {...register("password", { required: !selectedData })}
                />
                {usersError?.password && <small className="text-red-500">{usersError.password}</small>}
            </div>
            
            <DialogFooter className="mt-4 pt-4 border-t border-slate-200">
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 min-w-[120px]" disabled={loading}>
                     {loading ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : selectedData ? (
                      "Update Changes"
                    ) : (
                      "Save User"
                    )}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}