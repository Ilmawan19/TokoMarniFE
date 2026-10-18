"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useCrud from "@/hooks/useCRUD";
import { faArrowLeft, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import FinanceChart from "@/components/dashboard/FinanceChart";

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function Page() {
  const router = useRouter();
  const [filterType, setFilterType] = useState("monthly");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  });
  const [year, setYear] = useState(new Date().getFullYear());

  const {
    data: report,
    loading,
    error,
    token,
    fetchAllData: fetchReport,
  } = useCrud("reports/finance");

  const periodLabel =
    filterType === "monthly"
      ? `${MONTH_NAMES[parseInt(month.split("-")[1], 10) - 1]} ${month.split("-")[0]}`
      : `Tahun ${year}`;
  const reportTitle =
    filterType === "monthly"
      ? `Laporan Keuangan Bulanan — ${periodLabel}`
      : `Laporan Keuangan Tahunan — ${year}`;

  useEffect(() => {
    if (!token) return;
    loadReport();
  }, [token, filterType, month, year]);

  function loadReport() {
    const params = { filterType };
    if (filterType === "monthly") {
      params.month = month;
    } else {
      params.year = year;
    }
    fetchReport(params);
  }

  const exportExcel = async () => {
    if (!report?.summary) return;

    const XLSX = await import("xlsx");
    const columnName = filterType === "monthly" ? "Tanggal" : "Bulan";
    const rows = [
      ["Laporan Keuangan", reportTitle],
      [`Periode: ${periodLabel}`],
      [],
      ["Total Pemasukan", report.summary.totalIncome],
      ["Total Pengeluaran", report.summary.totalExpense],
      ["Laba/Rugi", report.summary.profit],
      [],
      [columnName, "Pemasukan", "Pengeluaran", "Laba/Rugi"],
      ...report.breakdown.map((row) => [row.label, row.income, row.expense, row.profit]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `laporan-keuangan-${filterType === "monthly" ? month : year}.xlsx`);
  };

  const profit = report?.summary?.profit ?? 0;
  const maxBar = report?.breakdown?.length
    ? Math.max(...report.breakdown.map((row) => Math.max(row.income, row.expense)), 1)
    : 1;

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
                Laporan Keuangan
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <input type="radio" id="monthly" name="filterType" value="monthly" checked={filterType === "monthly"} onChange={(e) => setFilterType(e.target.value)} />
                <Label htmlFor="monthly">Bulan</Label>
              </div>
              <div className="flex gap-2 items-center">
                <input type="radio" id="yearly" name="filterType" value="yearly" checked={filterType === "yearly"} onChange={(e) => setFilterType(e.target.value)} />
                <Label htmlFor="yearly">Tahun</Label>
              </div>
            </div>
            {filterType === "monthly" ? (
              <div className="flex gap-2 items-center">
                <Label>Pilih Bulan</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-10" />
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Label>Pilih Tahun</Label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 border border-input bg-background rounded-md px-3 text-sm">
                  {[...Array(6)].map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
            )}
            <Button
              className="sm:ml-auto h-10 px-5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-semibold gap-2"
              disabled={!report?.summary || loading}
              onClick={exportExcel}
            >
              <FontAwesomeIcon icon={faFileExcel} />
              Ekspor Excel
            </Button>
          </div>

          {loading || !report?.summary ? (
            error && !report?.summary ? (
              <p className="text-slate-500 text-center py-12">Gagal memuat laporan.</p>
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Pemasukan</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">Rp {numeral(report.summary.totalIncome).format("0,0")}</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Pengeluaran</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">Rp {numeral(report.summary.totalExpense).format("0,0")}</p>
                </div>
                <div className={`p-4 rounded-xl border ${profit >= 0 ? "bg-sky-50 border-sky-100" : "bg-red-50 border-red-100"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${profit >= 0 ? "text-sky-600" : "text-red-600"}`}>Laba/Rugi</p>
                  <p className={`mt-1 text-2xl font-bold ${profit >= 0 ? "text-slate-800" : "text-red-600"}`}>Rp {numeral(report.summary.profit).format("0,0")}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-600 mb-4">Grafik Pemasukan vs Pengeluaran</p>
                <div className="h-72">
                  <FinanceChart breakdown={report.breakdown} />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden mt-6">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100/80">
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-left font-semibold text-slate-600 uppercase">{filterType === "monthly" ? "Tanggal" : "Bulan"}</th>
                      <th className="p-3 text-right font-semibold text-slate-600 uppercase">Pemasukan</th>
                      <th className="p-3 text-right font-semibold text-slate-600 uppercase">Pengeluaran</th>
                      <th className="p-3 text-right font-semibold text-slate-600 uppercase">Laba/Rugi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.breakdown.map((row) => (
                      <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                        <td className="p-3 font-medium text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-20 shrink-0">{row.label}</span>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1 max-w-[200px] flex">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${(row.income / maxBar) * 100}%` }}
                              />
                              <div
                                className="h-full bg-rose-500"
                                style={{ width: `${(row.expense / maxBar) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium text-green-700">Rp {numeral(row.income).format("0,0")}</td>
                        <td className="p-3 text-right font-medium text-rose-700">Rp {numeral(row.expense).format("0,0")}</td>
                        <td className={`p-3 text-right font-semibold ${row.profit >= 0 ? "text-slate-800" : "text-red-600"}`}>Rp {numeral(row.profit).format("0,0")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
