
import { Product, Sale } from "./operatorPOS.types";

/**
 * Creates a bill HTML string for 58mm (212px) and 80mm (max 302px) paper.
 * Supports multiple products in a single sale.
 */
export function getBillHtml(sales: Sale[] | Sale, products: Product[]) {
  const items: Sale[] = Array.isArray(sales) ? sales : [sales];

  // Compose bill lines for each product
  let itemsRows = "";
  let grandTotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id);
    const unit = product?.unit || "";
    itemsRows += `
      <div style="display:flex;justify-content:space-between;">
        <span style="max-width:80px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${item.product_name}
        </span>
        <span style="text-align:right;">${item.quantity} ${unit}</span>
      </div>
      <div style="font-size:9px;color:#333;">Rate: ₨${product?.price?.toLocaleString() || 0} x ${item.quantity} = ₨${item.total.toLocaleString()}</div>
    `;
    grandTotal += Number(item.total);
  }

  return `
    <div style="width:212px;max-width:100vw;margin:0 auto;padding-top:4px;font-family:monospace;background:white;">
      <div style="text-align:center;">
        <div style="font-size:14px;font-weight:800;letter-spacing:1px;white-space:break-spaces;padding-bottom:2px;">Punjab Atta Chakki</div>
        <div style="font-size:9px;font-weight:400;">Main Street, Punjab</div>
        <div style="font-size:9px;font-weight:400;">Mob: +92-XXXXXXXXX</div>
        <div style="margin:6px 0 3px 0;border-bottom:1px dashed #333;">&nbsp;</div>
        <div style="font-size:10px;margin-bottom:2px;font-weight:700;">Sale Receipt</div>
      </div>
      <div style="font-size:10px;font-weight:700;display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
          <span style="text-align:left;">Item</span>
          <span style="text-align:right;">Qty</span>
      </div>
      ${itemsRows}
      <div style="margin:6px 0 3px 0;border-bottom:1px dashed #333;">&nbsp;</div>
      <div style="font-size:12px;font-weight:700;display:flex;justify-content:space-between;">
        <span>Total</span>
        <span>₨${grandTotal.toLocaleString()}</span>
      </div>
      <div style="margin-top:7px;text-align:center;font-size:10px;font-weight:700;">
        Thank You
      </div>
      <div style="text-align:center;font-size:8.5px;font-weight:500;margin-top:4px;">
        Powered by Punjab Atta Chakki POS
      </div>
    </div>
  `;
}
