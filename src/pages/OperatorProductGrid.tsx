
import React from "react";
import { Product } from "./operatorPOS.types";

type Props = {
  products: Product[];
  selected: string | null;
  onProductClick: (id: string) => void;
  loading?: boolean;
};

export default function OperatorProductGrid({ products, selected, onProductClick, loading }: Props) {
  if (loading) {
    return (
      <div className="col-span-full text-center text-lg text-gray-400 py-10">
        Loading products...
      </div>
    );
  }

  if (products.length === 0)
    return (
      <div className="col-span-full text-center text-lg text-gray-400 py-10">
        No matching products found.
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      {products.map((prod) => (
        <button
          key={prod.id}
          className={
            `rounded-xl shadow hover-scale border border-gray-100 bg-white hover:bg-emerald-50 flex flex-col items-center justify-center py-7 px-3 font-semibold text-lg relative group transition-all duration-150 
            ${selected === prod.id ? "ring-2 ring-emerald-500 bg-emerald-50" : ""}`
          }
          onClick={() => onProductClick(prod.id)}
          tabIndex={0}
        >
          <span className="group-hover:text-emerald-700">{prod.name}</span>
          <span className="block mt-1 text-sm text-gray-500 font-normal">{`₨${prod.price}/${prod.unit}`}</span>
          <span className="absolute top-2 right-4 text-xs bg-amber-100 text-amber-700 rounded-full px-2 font-semibold shadow">
            {prod.stock} {prod.unit}
          </span>
          <span className="absolute bottom-2 right-4 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 font-medium">
            {prod.category}
          </span>
        </button>
      ))}
    </div>
  );
}
