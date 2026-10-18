"use client";
import { Button } from "../ui/button";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from "react-icons/ai";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useParams } from "next/navigation";
import useCrud from "@/hooks/useCRUD";
import { SheetDescription } from "../ui/sheet";
import { useToast } from "@/hooks/use-toast";

const CartItemCard = ({ details, fetchOrder }) => {
  const { toast } = useToast();
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [quantity, setQuantity] = useState(details.quantity);
  const params = useParams();

  const {
    update: updateOrderDetail,
    loading,
    error,
  } = useCrud(`orders/${params.id}/detail/${details.id}`);
  const { remove: removeItem } = useCrud(`orders/${params.id}/detail`);

  useEffect(() => {
    setQuantity(details.quantity);
  }, [details]);

  const quantityIncrementHandler = async (qty) => {
    try {
      await updateOrderDetail("", {
        item_id: details.items.id,
        quantity: qty,
      });
      fetchOrder();
    } catch (error) {
      console.error(error);
    }
  };

  const quantityDecrementHandler = async (qty) => {
    if (qty <= 0) {
      setDeleteWarningOpen(true);
      return;
    } else {
      try {
        await updateOrderDetail("", {
          item_id: details.items.id,
          quantity: qty,
        });
        fetchOrder();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await removeItem(id);
      fetchOrder();
    } catch (err) {
      console.log(err);
    }
  };

  const quantityInputHandler = (e) => {
    const { value } = e.target;

    if (value === "") {
      setQuantity(value);
      return;
    }

    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      if (value > details.quantity + details.items.stock) {
        setQuantity(details.quantity + details.items.stock);
      } else {
        setQuantity(parsedValue);
      }
    }
  };

  const updateOrderDetailHandler = useCallback(async () => {
    try {
      if (quantity === "") {
        return;
      } else if (quantity < 1) {
        setQuantity(details.quantity);
        return;
      } else if (quantity > details.items.stock) {
        setQuantity(details.items.stock);
        return;
      } else {
        await updateOrderDetail("", {
          item_id: details.items.id,
          quantity: quantity,
        });
        fetchOrder();
      }
    } catch (error) {
      console.error(error);
    }
  }, [quantity]);

  useEffect(() => {
    if (quantity != details.quantity) {
      const timeout = setTimeout(updateOrderDetailHandler, 2000);
      return () => clearTimeout(timeout);
    }
  }, [quantity, updateOrderDetailHandler]);

  useEffect(() => {
    if (!error) return;
    toast({
      title: error?.quantity || "Insufficient stock",
      description: "",
      variant: "destructive",
      className: "",
    });
  }, [error]);

  return (
    <div className="flex justify-between items-center p-4 bg-white border border-slate-300 rounded-lg mb-3">
      <div>
        <p className="font-semibold">{details.items.name}</p>
        <p className="text-sm text-slate-600">
          Rp. {new Intl.NumberFormat().format(details.items.price)} x{" "}
          {details.quantity}
        </p>
        <p className="text-[.75rem] text-slate-500 mt-2">
          Quantity in stock:{" "}
          {new Intl.NumberFormat().format(details.items.stock)}
        </p>
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <Button
          type="button"
          onClick={() => setDeleteWarningOpen(true)}
          className="px-2 h-[2rem] bg-rose-500 border-[1px] border-rose-300 rounded-lg"
        >
          <AiOutlineDelete className="fill-white" />
          {/* Remove Item */}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => quantityDecrementHandler(quantity - 1)}
            className="px-2 h-[2rem] bg-white border-[1px] border-slate-300 hover:bg-slate-300 rounded-lg"
            type="button"
          >
            {loading ? (
              <div className="">
                <img src="/images/loader.gif" alt="Loading" className="w-4" />
              </div>
            ) : (
              <AiOutlineMinus className="fill-black" />
            )}
          </Button>
          <Input
            onChange={quantityInputHandler}
            value={quantity}
            type="text"
            className="w-[2.5rem] h-[2rem] px-1 border-[1px] border-slate-300 text-center active:outline-none"
          />
          <Button
            onClick={() => quantityIncrementHandler(quantity + 1)}
            className="px-2 h-[2rem] bg-white border-[1px] border-slate-300 hover:bg-slate-300 rounded-lg"
            type="button"
          >
            {loading ? (
              <div className="">
                <img src="/images/loader.gif" alt="Loading" className="w-4" />
              </div>
            ) : (
              <AiOutlinePlus className="fill-black" />
            )}
          </Button>
        </div>
      </div>

      <Dialog open={deleteWarningOpen} onOpenChange={setDeleteWarningOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <SheetDescription></SheetDescription>
          </DialogHeader>
          <p>
            This action cannot be undone. This will remove this item from cart
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="button2"
              onClick={() => setDeleteWarningOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="btn-error"
              variant="buttonCancel"
              onClick={() => handleDeleteItem(details.id)}
            >
              Remove Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartItemCard;
