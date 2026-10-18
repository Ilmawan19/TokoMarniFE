"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import nookies from "nookies";
import { jwtDecode } from "jwt-decode";
import {
  faBoxOpen,
  faCapsules,
  faStore,
  faClipboardList,
  faTruck,
  faUsers,
  faFileInvoiceDollar,
  faCashRegister,
  faCartShopping,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";

import ContentTop from "@/components/ContentTop";
import Card from "@/components/card";

const Dashboard = () => {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const { token: accessToken } = nookies.get();

    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setToken(decoded);
        setRole(decoded.role);
      } catch (error) {
        console.error("Failed to decode token", error);
        router.push("/login"); // Redirect if token is invalid
      }
    } else {
      router.push("/login"); // Redirect if no token
    }
  }, [router]);

  // Menu definitions with icons and descriptions
  const adminMenu = [
    {
      path: "/dashboard/items",
      text: "Items",
      icon: faCartShopping,
      subText: "Kelola item dan lacak inventaris.",
    },
    {
      path: "/dashboard/stock-cards",
      text: "Stock",
      icon: faBoxOpen,
      subText: "Pantau stok masuk, keluar, dan ketersediaan.",
    },
    {
      path: "/dashboard/history",
      text: "History",
      icon: faClipboardList,
      subText: "Lihat riwayat transaksi penjualan.",
    },
    {
      path: "/dashboard/penerimaan",
      text: "Penerimaan",
      icon: faTruck,
      subText: "Lacak penerimaan barang masuk.",
    },
    {
      path: "/dashboard/laporan",
      text: "Laporan",
      icon: faChartLine,
      subText: "Rekap pemasukan dan pengeluaran.",
    },
    {
      path: "/dashboard/users",
      text: "Users",
      icon: faUsers,
      subText: "Kelola akun pengguna dan peran.",
    },
    // {
    //   path: "/dashboard/slip-gaji",
    //   text: "Slip Gaji",
    //   icon: faFileInvoiceDollar,
    //   subText: "Manajemen dan pembuatan slip gaji.",
    // },
  ];

  const kasirMenu = [
    {
      path: "/dashboard/pos",
      text: "Kasir (POS)",
      icon: faCashRegister,
      subText: "Akses sistem Point of Sale.",
    },
    {
      path: "/dashboard/history",
      text: "History",
      icon: faClipboardList,
      subText: "Lihat riwayat transaksi penjualan.",
    },
    {
      path: "/dashboard/stock-cards",
      text: "Stock",
      icon: faBoxOpen,
      subText: "Lihat ketersediaan stok barang.",
    },
  ];

  const staffMenu = [
    {
      path: "/dashboard/penerimaan",
      text: "Penerimaan",
      icon: faTruck,
      subText: "Catat barang yang diterima.",
    },
    {
      path: "/dashboard/stock-cards",
      text: "Stock",
      icon: faBoxOpen,
      subText: "Lihat ketersediaan stok barang.",
    },
  ];

  const menuItems =
    role === "ADMIN"
      ? adminMenu
      : role === "KASIR"
        ? kasirMenu
        : role === "STAFF"
          ? staffMenu
          : [];

  return (
    // Main container with a modern background color
    <div className="w-full min-h-screen bg-slate-50">
      <main className="flex flex-col gap-8 pt-28 pb-12 px-6 md:px-10">
        <ContentTop />
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-5">Menu Navigasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                onClick={() => router.push(item.path)}
                text={item.text}
                icon={item.icon}
                subText={item.subText}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;