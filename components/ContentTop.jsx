"use client";

import nookies from "nookies";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import CardTop from "@/components/cardTop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import useCrud from "@/hooks/useCRUD";
import numeral from "numeral";
import { 
  faReceipt, 
  faMoneyBillWave, 
  faBoxesStacked,
  faCapsules,
  faCheckCircle,
  faPrint,
  faFileInvoiceDollar,
  faBan
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ContentTop() {
  const [token, setToken] = useState(null);
  const [totalsData, setTotalsData] = useState({ amount: 0, count: 0 });
  const [role, setRole] = useState("");
  const [isDailyTransactionModalOpen, setDailyTransactionModalOpen] = useState(false);
  const [isDailyIncomeModalOpen, setDailyIncomeModalOpen] = useState(false);
  const [isLowStockModalOpen, setLowStockModalOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [today, setToday] = useState("");

  const { data: totalsResult, fetchAllData: fetchTotals } = useCrud("histories/totals");
  const { data: lowStocks, fetchAllData: fetchLowStocks } = useCrud("items/low-stock");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("Selamat Pagi");
    else if (hour < 15) setGreeting("Selamat Siang");
    else if (hour < 19) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
    
    setToday(new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date()));

    const { token: accessToken } = nookies.get();
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setToken(decoded);
        setRole(decoded.role);
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }
  }, []);


  useEffect(() => {
    if (!token) return;

    fetchTotals({ period: "day" });
    fetchLowStocks();
  }, [token]);

  useEffect(() => {
    if (totalsResult?.summary) {
      setTotalsData({
        amount: totalsResult.summary._sum.amount || 0,
        count: totalsResult.summary._count.id || 0,
      });
    } else {
      setTotalsData({ amount: 0, count: 0 });
    }
  }, [totalsResult]);

  
  return (
    <div className="w-full p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {greeting}, {token?.name} 👋
          </h1>
          <p className="text-slate-500 mt-1">{today}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Dialog open={isDailyTransactionModalOpen} onOpenChange={setDailyTransactionModalOpen}>
          <DialogTrigger asChild>
            <CardTop
              topTitle="Total Transaksi Hari Ini"
              mainTitle={`${totalsData.count} Pesanan`}
              icon={faReceipt}
              onClick={() => setDailyTransactionModalOpen(true)}
              iconBgColor="bg-sky-100"
              iconTextColor="text-sky-600"
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-b from-sky-50 via-white to-white px-8 pt-8 pb-6 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-sky-100 rounded-full mx-auto mb-4 ring-8 ring-sky-50">
                    <FontAwesomeIcon icon={faReceipt} className="text-3xl text-sky-600"/>
                </div>
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center font-bold text-slate-800">Laporan Transaksi Harian</DialogTitle>
                </DialogHeader>
            </div>
            <ScrollArea className="h-[350px] px-2">
                <div className="p-6">
                    {totalsData.count > 0 && totalsResult?.histories ? (
                        <ul className="divide-y divide-slate-200">
                            {totalsResult.histories.map((order) => (
                                <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                                    <div>
                                        <p className="font-semibold text-slate-800">Order ID: {order.id}</p>
                                        <p className="text-xs text-slate-500">Status: {order.status}</p>
                                    </div>
                                    <p className="font-bold text-slate-800">Rp {numeral(order.amount).format("0,0")}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center gap-4 py-10">
                            <FontAwesomeIcon icon={faBan} className="text-4xl text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-700">Belum Ada Transaksi</h3>
                            <p className="text-slate-500 max-w-xs">Tidak ada data transaksi yang tercatat untuk hari ini.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <DialogFooter className="p-6 bg-slate-50 border-t">
              <Button variant="outline" onClick={() => setDailyTransactionModalOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDailyIncomeModalOpen} onOpenChange={setDailyIncomeModalOpen}>
          <DialogTrigger asChild>
            <CardTop
              topTitle="Pemasukan Hari Ini"
              mainTitle={`Rp ${numeral(totalsData.amount).format("0,0")}`}
              icon={faMoneyBillWave}
              onClick={() => setDailyIncomeModalOpen(true)}
              iconBgColor="bg-emerald-100"
              iconTextColor="text-emerald-600"
            />
          </DialogTrigger>
           <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-b from-emerald-50 via-white to-white px-8 pt-8 pb-6 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-emerald-100 rounded-full mx-auto mb-4 ring-8 ring-emerald-50">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-3xl text-emerald-600"/>
                </div>
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center font-bold text-slate-800">Laporan Pemasukan Harian</DialogTitle>
                </DialogHeader>
            </div>
            <div className="p-6 text-center">
                 <p className="text-slate-500">Total Pemasukan</p>
                 <p className="text-5xl font-bold text-emerald-600 my-4">Rp {numeral(totalsData.amount).format("0,0")}</p>
                 <p className="text-slate-500">dari <span className="font-bold text-slate-700">{totalsData.count}</span> transaksi berhasil.</p>
            </div>
            <DialogFooter className="p-6 bg-slate-50 border-t">
              <Button variant="outline" onClick={() => setDailyIncomeModalOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isLowStockModalOpen} onOpenChange={setLowStockModalOpen}>
          <DialogTrigger asChild>
            <CardTop
              topTitle="Stok Menipis"
              mainTitle={`${lowStocks?.length ?? 0} Item`}
              icon={faBoxesStacked}
              onClick={() => setLowStockModalOpen(true)}
              iconBgColor="bg-amber-100"
              iconTextColor="text-amber-600"
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-b from-amber-50 via-white to-white px-8 pt-8 pb-6 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-amber-100 rounded-full mx-auto mb-4 ring-8 ring-amber-50">
                <FontAwesomeIcon icon={faBoxesStacked} className="text-3xl text-amber-600"/>
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-center font-bold text-slate-800">Laporan Stok Kritis</DialogTitle>
              </DialogHeader>
            </div>
            <ScrollArea className="h-[350px] px-2">
              <div className="p-6">
                {lowStocks?.length > 0 ? (
                  <ul className="divide-y divide-slate-200">
                      {lowStocks.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-4 py-4 px-2 rounded-lg transition-colors hover:bg-slate-50">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
                              <FontAwesomeIcon icon={faCapsules} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-500">SKU: {item.sku || 'N/A'}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700 ring-1 ring-inset ring-red-200">
                            Sisa: {item.stock}
                          </span>
                        </li>
                      ))}
                    </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-4 py-10">
                    <div className="w-20 h-20 flex items-center justify-center bg-emerald-100 rounded-full">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Semua Stok Aman!</h3>
                    <p className="text-slate-500 max-w-xs">
                      Tidak ada item yang stoknya menipis saat ini. Kerja bagus dalam menjaga inventaris!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 bg-slate-50 border-t">
              <Button variant="outline" onClick={() => setLowStockModalOpen(false)}>Tutup</Button>
              <Button disabled={!lowStocks?.length} onClick={() => window.print()}>
                <FontAwesomeIcon icon={faPrint} className="mr-2" />
                Cetak Laporan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ContentTop;