
import React from "react";
import { Input } from "@/components/ui/input";
import { Product } from "./OperatorPOS";

type Props = {
  product: Product;
  quantity: string;
  setQuantity: (v: string) => void;
  onConfirm: () => void;
};

export default function OperatorSaleInput({ product, quantity, setQuantity, onConfirm }: Props) {
  return (
    <div className="my-6 flex flex-col md:flex-row md:items-center gap-4 border rounded-lg p-6 bg-white shadow animate-fade-in">
      <div className="font-semibold text-lg flex-1">
        {product.name}
      </div>
      <Input
        className="border-gray-300 rounded px-4 py-2 w-24 text-lg font-semibold focus:ring-amber-500"
        type="number"
        autoFocus
        step={0.1}
        min={0}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Qty"
      />
      <button
        onClick={onConfirm}
        className="ml-0 md:ml-4 px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-shadow"
      >
        Confirm Sale
      </button>
    </div>
  );
}
