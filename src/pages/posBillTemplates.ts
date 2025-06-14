
import { Product, Sale } from "./OperatorPOS";

/**
 * Creates a bill HTML string for 58mm (212px) and 80mm (max 302px) paper.
 * By default, will fit on 58mm (2.24 inch) thermal receipt paper.
 * For best results, print with no margins, on non-scaling mode in your browser/printer settings.
 */
export function getBillHtml(sale: Sale, products: Product[]) {
  const product = products.find((p) => p.id === sale.productId);
  // 212px = 58mm, 302px = 80mm. We'll use 212px for strict 58mm compatibility.
  return `
    <div style="width:212px;max-width:100vw;margin:0 auto;padding-top:4px;font-family:monospace;background:white;">
      <div style="text-align:center;">
        <!-- You can add a logo here if you use an image, for now just show the name super bold/large -->
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
      <div style="font-size:10px;display:flex;justify-content:space-between;">
          <span style="max-width:72px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sale.productName}</span>
          <span style="text-align:right;">${sale.quantity} ${product?.unit}</span>
      </div>
      <div style="font-size:9px;margin:2px 0 1px 0;">
          Rate: ₨${sale.price.toLocaleString()} x ${sale.quantity} = <b>₨${sale.total.toLocaleString()}</b>
      </div>
      <div style="margin:6px 0 3px 0;border-bottom:1px dashed #333;">&nbsp;</div>
      <div style="font-size:9px;">
          <b>Date:</b> ${sale.date}
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
