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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdFilterListAlt } from "react-icons/md";
import { Header } from "@/components/header";
import useCrud from "@/hooks/useCRUD";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
    const router = useRouter();
    const [sortBy, setSortBy] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedData, setSelectedData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { toast } = useToast();
    const {
        data: users,
        error: usersError,
        fetchAllData: fetchAllUserData,
        create: createUserData,
        pagination: usersPagination,
        token,
        totalPages,
    } = useCrud("users");

    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            await createUserData(data);
            toast({
                title: "Data successfully created!",
                description: "",
                variant: "success",
            });
            setIsOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            loadData();
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    useEffect(() => {
        if (!token) return;
        fetchAllUserData({ page: currentPage, search, sortBy });
    }, [token, currentPage, search]);

    const loadData = () => {
        fetchAllUserData({
            page: currentPage,
            search,
            sortBy,
        });
    };

    // SlipGajiForm component
    const SlipGajiForm = ({ email, userData, onClose, name, outlet, id }) => {
        const { create, loading } = useCrud("send-slip-gaji");

        const { register, handleSubmit, reset } = useForm({
            defaultValues: {
                email: email,
                nama: name,
                userId: id,
            },
        });

        const onSubmit = async (data) => {
            try {
                await create(data);
                toast({
                    title: "Slip gaji berhasil dikirim!",
                    variant: "success",
                });
                onClose();
                reset();
            } catch (err) {
                console.error("Error sending slip gaji:", err);
                toast({
                    title: "Gagal mengirim slip gaji",
                    description: err.message || "Terjadi kesalahan",
                    variant: "error",
                });
            }
        };

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" className="col-span-3" value={email} readOnly {...register("email")} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama" className="text-right">Nama</Label>
                    <Input id="nama" className="col-span-3" value={name} readOnly {...register("nama")} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="userId" className="text-right">User ID</Label>
                    <Input id="userId" className="col-span-3" {...register("userId")} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gajiPokok" className="text-right">Gaji Pokok</Label>
                    <Input id="gajiPokok" className="col-span-3" {...register("gajiPokok")} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tunjanganRokok" className="text-right">Tunjangan Pokok</Label>
                    <Input id="tunjanganRokok" className="col-span-3" {...register("tunjanganRokok")} />
                </div>
                {!email && (
                    <p className="text-sm text-red-500">
                        User ini belum memiliki email, slip gaji tidak dapat dikirim.
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="buttonCancel" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="col-span-3" variant="button2" disabled={loading || !email}>Kirim Slip Gaji</Button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="bg-slate-100 w-screen min-h-screen py-12 px-4 lg:px-32 pb-32 ">
                <div className="bg-white p-12 rounded-xl shadow lg:mt-20 md:mt-16 mt-10">
                    <div className="flex justify-between items-center">
                        <h1 className="font-bold mb-8 w-full">List of Users</h1>
                        <div className="flex items-center justify-end gap-4 w-full">
                            <Input
                                className="max-w-lg bg-gray-50 rounded-full h-16 text-lg px-4"
                                placeholder="Search"
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="button1" onClick={() => router.push("/dashboard")}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Button>
                    </div>

                    <div className="mt-8 rounded-xl overflow-hidden">
                        <Table className="min-w-full table-auto border-collapse">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] p-2 bg-[#8BB2B2] text-center text-white">No.</TableHead>
                                    <TableHead className="p-2 bg-[#8BB2B2] text-left text-white">Name</TableHead>
                                    <TableHead className="p-2 bg-[#8BB2B2] text-left text-white">Email</TableHead>
                                    <TableHead className="p-2 bg-[#8BB2B2] text-left text-white">Role</TableHead>
                                    <TableHead className="p-2 bg-[#8BB2B2] text-center text-white">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((row, index) => (
                                    <TableRow key={row.id} className="border-b hover:bg-gray-100 transition-colors">
                                        <TableCell className="p-2 text-center font-bold">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell className="p-2">{row.name}</TableCell>
                                        <TableCell className="p-2">{row.email || "-"}</TableCell>
                                        <TableCell className="p-2">{row.role}</TableCell>
                                        <TableCell className="p-2 text-center">
                                            <Button variant="button2"  onClick={() => {
                                                setSelectedData(row);
                                                setIsOpen(true);
                                                reset({ email: row.email, nama: row.name });
                                            }}>Send Slip Gaji</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>

            {/* Slip Gaji Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Slip Gaji</DialogTitle>
                    </DialogHeader>
                    {selectedData && (
                        <SlipGajiForm
                            email={selectedData.email}
                            userData={selectedData}
                            onClose={() => setIsOpen(false)}
                            name={selectedData.name}
                            id={selectedData.id}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
