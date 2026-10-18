"use client";

import useCrud from "@/hooks/useCRUD";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import numeral from "numeral";
import Lottie from "react-lottie-player";
import successLottie from "@/public/images/success.json";
import cancelLottie from "@/public/images/cancel.json";
import moment from "moment";

const Transaction = ({ orderDetails, amount, setAmount }) => {
  const audioRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedOrder, setSetselectedOrder] = useState(orderDetails.id || "");
  const params = useParams();
  const router = useRouter();
  
  const { fetchAllData: getOrderData, data: orderData } = useCrud(`orders/${params.id}`);
  const { update: cancelOrder } = useCrud(`orders/${params.id}/cancel`);
  const { update: holdOrder } = useCrud(`orders/${params.id}/hold`);
  const { update: successOrder } = useCrud(`orders/${params.id}/success`);
  const { fetchAllData: getOrderOnHold, data: orderOnHold } = useCrud(`orders/hold`);

  useEffect(() => {
    getOrderData();
  }, [orderDetails]);

  useEffect(() => {
    if (paymentMethod === "QRIS" && orderData?.total_payment) {
      setAmount(numeral(orderData.total_payment).format('0,0'));
    }
  }, [paymentMethod, orderData?.total_payment]);

  useEffect(() => {
    getOrderOnHold();
  }, [isCancel]);

  useEffect(() => {
    if (selectedOrder) {
        router.push(`/dashboard/pos/${selectedOrder}`);
    }
  }, [selectedOrder, router]);

  const amountHandler = (e) => {
    const { value } = e.target;
    const prevAmount = amount.replace(/,/g, "");
    if ((prevAmount + value).length > 12) return;
    const newAmount = prevAmount + value;
    setAmount(new Intl.NumberFormat().format(newAmount));
  };

  const amountTypingHandler = (e) => {
    const { value } = e.target;
    const newAmount = value.replace(/[^0-9]/g, "");
    if (newAmount.length > 12) return;
    setAmount(newAmount ? new Intl.NumberFormat().format(newAmount) : "");
  };

  const deleteAmountHandler = () => {
    if (amount === "") return;
    setAmount((prev) => {
      const prevAmount = prev.replace(/,/g, "").slice(0, -1);
      return prevAmount ? new Intl.NumberFormat().format(prevAmount) : "";
    });
  };

  const clearAmountHandler = () => {
    setAmount("");
  };

  const addCompleteAmount = (e) => {
    const { value } = e.target;
    let newAmount;
    if (amount !== "") {
      const prevAmount = parseInt(amount.replace(/,/g, ""), 10);
      newAmount = prevAmount + parseInt(value, 10);
    } else {
      newAmount = parseInt(value, 10);
    }
    if (String(newAmount).length > 12) return;
    setAmount(new Intl.NumberFormat().format(newAmount));
  };

  const cancelOrderHandler = async () => {
    try {
      await cancelOrder("", { items: orderDetails });
      setIsCancel(true);
    } catch (error) {
      console.log(error);
    }
  };

  const holdOrderHandler = async () => {
    try {
      await holdOrder("", { items: orderDetails });
      router.push(`/dashboard/pos`);
    } catch (error) {}
  };

  const successOrderHandler = async () => {
    try {
      await successOrder("", {
        amount: parseInt(amount.replace(/,/g, "") || "0", 10),
      });
      setIsOpen(true);
    } catch (error) {}
  };

  // Variabel untuk styling tombol yang konsisten
  const keypadButtonClasses = "h-16 text-xl font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2";
  const numpadButtonClasses = `${keypadButtonClasses} bg-white border border-slate-300 text-slate-700 hover:bg-sky-50 hover:border-sky-400`;
  const denominationButtonClasses = `${keypadButtonClasses} text-sm bg-white border border-slate-300 text-slate-700 hover:bg-sky-50 hover:border-sky-400`;
  const specialButtonClasses = `${keypadButtonClasses} bg-rose-500 text-white hover:bg-rose-600`;
  const payAllButtonClasses = `${keypadButtonClasses} text-sm bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200`;

  return (
    <>
      <div className="relative flex flex-col justify-between h-full bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 overflow-hidden">
        {/* Header Pembayaran */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-800">Payment</h1>
          <select
            name="payment_method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="bg-slate-100 border-transparent rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition capitalize"
          >
            <option>Cash</option>
            <option>QRIS</option>
          </select>
        </div>

        {/* Keypad & Input */}
        <div className="flex-grow bg-slate-50/70 p-4 sm:p-6">
          {paymentMethod === "QRIS" ? (
            <div className="h-full flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 4h2m-6-7h2m0 4h2m6 1v4m-2 0h2m-8-6h-2m6 0h2m-6-4h2" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-slate-800 mb-1">QRIS Payment</p>
              <p className="text-sm text-slate-500 text-center max-w-xs mb-5">
                Minta pelanggan memindai kode QRIS pada tombol &quot;Bayar QRIS&quot; untuk menyelesaikan pembayaran.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-sm text-slate-500">Amount Due</span>
                <span className="text-3xl font-mono font-bold text-sky-600">
                  Rp {numeral(orderData?.total_payment || 0).format('0,0')}
                </span>
              </div>
              <Button
                disabled={orderDetails.length <= 0}
                className="w-full max-w-xs h-14 text-base font-semibold rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300"
                onClick={() => successOrderHandler()}
              >
                Pembayaran Selesai
              </Button>
              <p className="text-xs text-slate-400 mt-3">
                Klik setelah pelanggan menyelesaikan pembayaran QRIS.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-4 gap-3">
            <Input
              className="col-span-4 h-16 w-full bg-white text-right text-4xl font-mono tracking-wider border-slate-200 focus:ring-2 focus:ring-sky-500"
              onChange={amountTypingHandler}
              value={amount}
              placeholder="0"
              type="text"
            />
            <div className="grid grid-cols-2 col-span-2 gap-3 mt-3">
              {['1000', '2000', '5000', '10000', '20000', '50000', '100000'].map(value => (
                <Button key={value} value={value} onClick={addCompleteAmount} className={denominationButtonClasses}>
                  Rp {numeral(value).format('0,0')}
                </Button>
              ))}
              <Button
                className={payAllButtonClasses}
                onClick={() => setAmount(numeral(orderData?.total_payment || 0).format('0,0'))}
              >
                Pay Full Amount
              </Button>
            </div>
            <div className="grid grid-cols-3 col-span-2 gap-3 mt-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <Button key={num} onClick={amountHandler} value={num} className={numpadButtonClasses}>{num}</Button>
              ))}
              <Button onClick={clearAmountHandler} className={specialButtonClasses}>C</Button>
              <Button onClick={amountHandler} value={"0"} className={numpadButtonClasses}>0</Button>
              <Button onClick={deleteAmountHandler} className={specialButtonClasses}>Del</Button>
            </div>
          </div>
          )}
        </div>

        {/* Ringkasan & Aksi */}
        <div className="w-full flex flex-col justify-center p-6 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="space-y-2 text-base font-medium text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Due</span>
              <span className="font-mono">Rp {numeral(orderData?.total_payment || 0).format('0,0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Received</span>
              <span className="font-mono">Rp {numeral(amount).format('0,0')}</span>
            </div>
            <div className="flex justify-between pt-2 mt-2 border-t-2 border-dashed border-slate-200 text-lg font-bold">
              <span className="text-slate-800">Change</span>
              <span className="text-sky-600 font-mono">
                Rp {numeral(Math.max(0, (parseInt(amount.replace(/,/g, '') || '0') - parseInt(orderData?.total_payment || '0')))).format('0,0')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-14 text-base font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-colors">Cancel</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">Confirm Cancellation</DialogTitle>
                  <DialogDescription className="text-center text-slate-500 pt-2">
                    Are you sure you want to cancel this transaction? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <DialogClose asChild className="w-full">
                    <Button variant="outline" className="h-11">Go Back</Button>
                  </DialogClose>
                  <Button onClick={cancelOrderHandler} className="w-full h-11 bg-rose-600 text-white hover:bg-rose-700">Yes, Cancel</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-14 text-base font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">Hold</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">Confirm Hold</DialogTitle>
                  <DialogDescription className="text-center text-slate-500 pt-2">
                    Hold this transaction to resume later?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <DialogClose asChild className="w-full">
                     <Button variant="outline" className="h-11">Go Back</Button>
                  </DialogClose>
                  <Button onClick={holdOrderHandler} className="w-full h-11 bg-yellow-500 text-white hover:bg-yellow-600">Yes, Hold</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={paymentMethod === "QRIS"
                    ? orderDetails.length <= 0
                    : parseInt(amount.replace(/,/g, '') || '0') < (orderData?.total_payment || 0) || orderDetails.length <= 0}
                  className="w-full h-14 text-base font-semibold rounded-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {paymentMethod === "QRIS" ? "Bayar QRIS" : "Pay"}
                </Button>
              </DialogTrigger>
              {paymentMethod === "QRIS" ? (
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">Scan QRIS</DialogTitle>
                  <DialogDescription className="text-center text-slate-500 pt-2">
                    Pindai kode QRIS berikut untuk menyelesaikan pembayaran sebesar{" "}
                    <span className="font-semibold text-slate-700">Rp {numeral(orderData?.total_payment || 0).format('0,0')}</span>.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <img
                    src="/images/qris.jpeg"
                    alt="QRIS"
                    className="w-56 h-56 object-contain rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex justify-center mt-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="h-11 px-8">Tutup</Button>
                  </DialogClose>
                </div>
              </DialogContent>
              ) : (
              <DialogContent>
                 <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">Confirm Payment</DialogTitle>
                  <DialogDescription className="text-center text-slate-500 pt-2">
                    Please ensure all details are correct before finalizing.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <DialogClose asChild className="w-full">
                     <Button variant="outline" className="h-11">Go Back</Button>
                  </DialogClose>
                  <Button onClick={successOrderHandler} className="w-full h-11 bg-sky-600 text-white hover:bg-sky-700">Complete Payment</Button>
                </div>
              </DialogContent>
              )}
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Dialog untuk status transaksi (sukses atau batal) */}
      <Dialog open={isCancel} onOpenChange={() => {}}>
        <DialogContent hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-rose-600">Transaction Canceled</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex w-full justify-center my-4">
              <Lottie loop={false} animationData={cancelLottie} play style={{ width: 200, height: 200 }} />
            </div>
            {orderOnHold?.length > 0 && (
              <select
                className="border p-2 rounded-lg mt-2 mb-4 w-full h-11 focus:ring-2 focus:ring-sky-500 text-sm capitalize"
                value={selectedOrder}
                onChange={(e) => setSetselectedOrder(e.target.value)}
              >
                <option value="">Continue Previous Transaction</option>
                {orderOnHold?.map((row) => (
                  <option value={row.id} key={row.id}>
                    {row.public_id} - {moment(row.created_at).fromNow()}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-3 mt-3">
              <Button onClick={() => router.push("/dashboard")} className="w-full h-12 bg-slate-100 text-slate-800 hover:bg-slate-200">Dashboard</Button>
              <Button onClick={() => router.push("/dashboard/pos")} className="w-full h-12 bg-sky-600 text-white hover:bg-sky-700">New Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-green-600">Transaction Complete</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex w-full justify-center">
              <Lottie loop={false} animationData={successLottie} play speed={0.8} style={{ width: 280, height: 280 }} />
            </div>
            <audio ref={audioRef} autoPlay>
              <source src="/success.mp3" type="audio/mpeg" />
            </audio>
            <div className="flex gap-3 mt-3">
              <Button onClick={() => router.push("/dashboard")} className="w-full h-12 bg-slate-100 text-slate-800 hover:bg-slate-200">Dashboard</Button>
              <Button onClick={() => router.push("/dashboard/pos")} className="w-full h-12 bg-sky-600 text-white hover:bg-sky-700">Next Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Transaction;