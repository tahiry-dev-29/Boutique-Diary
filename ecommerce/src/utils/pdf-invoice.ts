import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface InvoiceData {
  id: string;
  reference: string;
  status: string;
  total: number;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    address?: string;
  };
  items: Array<{
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    variant?: string;
  }>;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    maximumFractionDigits: 0,
  }).format(amount);

export const generateInvoicePDF = (order: InvoiceData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const orderDate = format(new Date(order.createdAt), "dd MMMM yyyy", {
    locale: fr,
  });

  
  const primaryColor = "#d4a373";
  const textColor = "#1f2937";
  const grayColor = "#666666";

  
  doc.setFontSize(28);
  doc.setTextColor(textColor);
  doc.text("Boutique", 20, 30);

  doc.setFontSize(28);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "italic");
  doc.text("Diary", 67, 30);

  
  doc.setFont("helvetica", "normal");

  
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text("Votre boutique de confiance", 20, 38);

  
  doc.setFontSize(24);
  doc.setTextColor(textColor);
  doc.text("FACTURE", pageWidth - 20, 25, { align: "right" });

  doc.setFontSize(11);
  doc.setTextColor(grayColor);
  doc.text(`#${order.reference}`, pageWidth - 20, 33, { align: "right" });
  doc.text(orderDate, pageWidth - 20, 40, { align: "right" });

  
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 50, pageWidth - 20, 50);

  
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text("FACTURÉ À", 20, 65);

  doc.setFontSize(12);
  doc.setTextColor(textColor);
  doc.text(order.customer.name, 20, 73);

  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text(order.customer.email, 20, 80);

  if (order.customer.address) {
    doc.text(order.customer.address.substring(0, 60), 20, 87);
  }

  
  let yPos = 105;
  doc.setFillColor(248, 248, 248);
  doc.rect(20, yPos - 5, pageWidth - 40, 10, "F");

  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  doc.text("DESCRIPTION", 22, yPos + 2);
  doc.text("QTÉ", 120, yPos + 2);
  doc.text("PRIX", 145, yPos + 2);
  doc.text("TOTAL", pageWidth - 22, yPos + 2, { align: "right" });

  
  yPos += 15;
  doc.setTextColor(textColor);

  order.items.forEach(item => {
    doc.setFontSize(11);
    doc.text(item.productName.substring(0, 40), 22, yPos);

    if (item.variant) {
      doc.setFontSize(9);
      doc.setTextColor(grayColor);
      doc.text(item.variant, 22, yPos + 5);
      doc.setTextColor(textColor);
    }

    doc.setFontSize(11);
    doc.text(`x${item.quantity}`, 120, yPos);
    doc.text(formatMoney(item.price), 145, yPos);
    doc.text(formatMoney(item.price * item.quantity), pageWidth - 22, yPos, {
      align: "right",
    });

    
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 8, pageWidth - 20, yPos + 8);

    yPos += item.variant ? 18 : 15;
  });

  
  yPos += 10;

  
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text("Sous-total", 130, yPos);
  doc.text(formatMoney(order.total), pageWidth - 22, yPos, { align: "right" });

  yPos += 8;
  doc.text("Livraison", 130, yPos);
  doc.text("Gratuite", pageWidth - 22, yPos, { align: "right" });

  
  yPos += 12;
  doc.setDrawColor(textColor);
  doc.setLineWidth(0.5);
  doc.line(130, yPos - 3, pageWidth - 20, yPos - 3);

  doc.setFontSize(14);
  doc.setTextColor(textColor);
  doc.text("Total", 130, yPos + 5);
  doc.text(formatMoney(order.total), pageWidth - 22, yPos + 5, {
    align: "right",
  });

  
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.3);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text("Merci pour votre confiance !", pageWidth / 2, footerY, {
    align: "center",
  });
  doc.text(
    "Boutique Diary - contact@boutique-diary.mg",
    pageWidth / 2,
    footerY + 7,
    { align: "center" },
  );

  
  doc.save(`Facture-${order.reference}.pdf`);
};
