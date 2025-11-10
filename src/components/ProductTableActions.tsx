import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Product } from "@/types/product";

export default function ProductTableActions({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        title="Edit"
        onClick={() => onEdit(product)}
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        title="Delete"
        onClick={() => onDelete(product)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </>
  );
}
