import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface InvoiceData {
  id: string;
  reference: string;
  status: "PAID" | "PENDING" | "CANCELLED";
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

const STYLE = {
  colors: {
    primary: "#d4a373",
    secondary: "#faedcd",
    text: {
      dark: "#111827",
      medium: "#4b5563",
      light: "#9ca3af",
    },
    accent: "#ef4444",
    white: "#ffffff",
    tableHeader: "#f9fafb",
    tableStripe: "#fdfdfd",
    border: "#e5e7eb",
  },
  layout: {
    marginX: 20,
    lineHeight: 7,
  },
  fonts: {
    main: "helvetica",
  },
};

const formatMoney = (amount: number): string =>
  new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    maximumFractionDigits: 0,
  }).format(amount);

const drawStatusBadge = (doc: jsPDF, status: string, x: number, y: number) => {
  type StatusConfig = {
    [key: string]: { text: string; color: string };
  };

  const statusConfig: StatusConfig = {
    PAID: { color: "#10b981", text: "PAYÉ" },
    COMPLETED: { color: "#10b981", text: "TERMINÉ" },
    PENDING: { color: "#f59e0b", text: "EN ATTENTE" },
    CANCELLED: { color: "#ef4444", text: "ANNULÉ" },
  };

  const config = statusConfig[status] || {
    color: STYLE.colors.text.light,
    text: status,
  };

  doc.setFillColor(config.color);
  doc.roundedRect(x - 22, y - 4, 22, 6, 1, 1, "F");

  doc.setFontSize(8);
  doc.setTextColor(STYLE.colors.white);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text(config.text, x - 11, y, { align: "center" });
};

const drawHeader = (doc: jsPDF, pageWidth: number) => {
  doc.setFillColor(STYLE.colors.primary);
  doc.rect(0, 0, pageWidth, 5, "F");

  doc.setFontSize(28);
  doc.setTextColor(STYLE.colors.text.dark);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text("Boutique", STYLE.layout.marginX, 25);

  doc.setTextColor(STYLE.colors.primary);
  doc.setFont(STYLE.fonts.main, "italic");
  doc.text("Diary", STYLE.layout.marginX + 48, 25);

  doc.setFont(STYLE.fonts.main, "normal");
  doc.setFontSize(9);
  doc.setTextColor(STYLE.colors.text.medium);
  doc.text("Votre boutique de confiance", STYLE.layout.marginX, 31);
};

const drawInvoiceDetails = (
  doc: jsPDF,
  order: InvoiceData,
  pageWidth: number,
) => {
  const rightX = pageWidth - STYLE.layout.marginX;
  const date = format(new Date(order.createdAt), "dd/MM/yyyy", {
    locale: fr,
  });

  doc.setFontSize(22);
  doc.setTextColor(STYLE.colors.text.dark);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text("FACTURE", rightX, 25, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(STYLE.colors.text.medium);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text(`RÉF: ${order.reference}`, rightX, 32, { align: "right" });

  doc.setFont(STYLE.fonts.main, "normal");
  doc.setTextColor(STYLE.colors.text.light);
  doc.text(`DATE: ${date}`, rightX, 37, { align: "right" });

  drawStatusBadge(doc, order.status, rightX, 45);
};

const drawCustomerSection = (
  doc: jsPDF,
  customer: InvoiceData["customer"],
  startY: number,
  pageWidth: number,
) => {
  doc.setDrawColor(STYLE.colors.border);
  doc.line(
    STYLE.layout.marginX,
    startY - 10,
    pageWidth - STYLE.layout.marginX,
    startY - 10,
  );

  doc.setFontSize(9);
  doc.setTextColor(STYLE.colors.text.light);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text("DESTINATAIRE", STYLE.layout.marginX, startY);

  doc.setFontSize(11);
  doc.setTextColor(STYLE.colors.text.dark);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text(customer.name, STYLE.layout.marginX, startY + 7);

  doc.setFont(STYLE.fonts.main, "normal");
  doc.setTextColor(STYLE.colors.text.medium);
  doc.text(customer.email, STYLE.layout.marginX, startY + 13);

  if (customer.address) {
    const addressLines = doc.splitTextToSize(customer.address, 100);
    doc.text(addressLines, STYLE.layout.marginX, startY + 19);
  }

  const rightX = pageWidth - STYLE.layout.marginX;
  doc.setFontSize(9);
  doc.setTextColor(STYLE.colors.text.light);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text("ÉMETTRICE", rightX, startY, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(STYLE.colors.text.dark);
  doc.text("Boutique Diary", rightX, startY + 7, { align: "right" });
  doc.setFont(STYLE.fonts.main, "normal");
  doc.text("Antananarivo, Madagascar", rightX, startY + 13, { align: "right" });
  doc.text("contact@boutique-diary.mg", rightX, startY + 19, {
    align: "right",
  });
};

const drawTable = (
  doc: jsPDF,
  items: InvoiceData["items"],
  startY: number,
  pageWidth: number,
): number => {
  let yPos = startY;
  const rightX = pageWidth - STYLE.layout.marginX;
  const tableWidth = pageWidth - STYLE.layout.marginX * 2;

  doc.setFillColor(STYLE.colors.text.dark);
  doc.rect(STYLE.layout.marginX, yPos - 6, tableWidth, 9, "F");

  doc.setFontSize(8);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.setTextColor(STYLE.colors.white);

  doc.text("DESCRIPTION", STYLE.layout.marginX + 4, yPos);
  doc.text("QUANTITÉ", pageWidth - 75, yPos);
  doc.text("PRIX UNITAIRE", pageWidth - 55, yPos);
  doc.text("TOTAL", rightX - 4, yPos, { align: "right" });

  yPos += 10;

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(STYLE.colors.tableStripe);
      doc.rect(STYLE.layout.marginX, yPos - 5, tableWidth, 12, "F");
    }

    doc.setFontSize(9);
    doc.setTextColor(STYLE.colors.text.dark);
    doc.setFont(STYLE.fonts.main, "medium");

    const productName = item.productName;
    doc.text(productName, STYLE.layout.marginX + 4, yPos);

    if (item.variant) {
      doc.setFontSize(7);
      doc.setTextColor(STYLE.colors.text.light);
      doc.text(item.variant, STYLE.layout.marginX + 4, yPos + 4);
      doc.setTextColor(STYLE.colors.text.dark);
      doc.setFontSize(9);
    }

    doc.text(`${item.quantity}`, pageWidth - 75, yPos, { align: "center" });
    doc.text(formatMoney(item.price), pageWidth - 55, yPos);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.text(formatMoney(item.price * item.quantity), rightX - 4, yPos, {
      align: "right",
    });
    doc.setFont(STYLE.fonts.main, "normal");

    yPos += item.variant ? 14 : 12;
  });

  return yPos;
};

const drawTotals = (
  doc: jsPDF,
  total: number,
  startY: number,
  pageWidth: number,
) => {
  let yPos = startY + 10;
  const rightX = pageWidth - STYLE.layout.marginX;
  const labelX = pageWidth - 80;

  doc.setDrawColor(STYLE.colors.border);
  doc.line(labelX - 10, yPos - 5, rightX, yPos - 5);

  doc.setFontSize(10);
  doc.setTextColor(STYLE.colors.text.medium);
  doc.text("Sous-total", labelX, yPos);
  doc.text(formatMoney(total), rightX, yPos, { align: "right" });

  yPos += 8;
  doc.text("Livraison", labelX, yPos);
  doc.setTextColor(STYLE.colors.primary);
  doc.text("Gratuite", rightX, yPos, { align: "right" });

  yPos += 12;

  doc.setFillColor(STYLE.colors.secondary);
  doc.rect(labelX - 10, yPos - 8, rightX - (labelX - 10), 14, "F");

  doc.setFontSize(12);
  doc.setTextColor(STYLE.colors.text.dark);
  doc.setFont(STYLE.fonts.main, "bold");
  doc.text("TOTAL", labelX, yPos);
  doc.text(formatMoney(total), rightX, yPos, { align: "right" });
};

const drawFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  const footerY = pageHeight - 20;

  doc.setDrawColor(STYLE.colors.primary);
  doc.setLineWidth(0.5);
  doc.line(
    STYLE.layout.marginX,
    footerY,
    pageWidth - STYLE.layout.marginX,
    footerY,
  );

  doc.setFontSize(8);
  doc.setTextColor(STYLE.colors.text.light);
  doc.setFont(STYLE.fonts.main, "normal");

  doc.text("Merci pour votre commande !", pageWidth / 2, footerY + 8, {
    align: "center",
  });

  doc.setFontSize(7);
  doc.text(
    "Cette facture est générée électroniquement et ne nécessite pas de signature.",
    pageWidth / 2,
    footerY + 13,
    { align: "center" },
  );
};

export const generateInvoicePDF = (order: InvoiceData): void => {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  drawHeader(doc, pageWidth);
  drawInvoiceDetails(doc, order, pageWidth);
  drawCustomerSection(doc, order.customer, 65, pageWidth);

  const tableEndY = drawTable(doc, order.items, 105, pageWidth);
  drawTotals(doc, order.total, tableEndY, pageWidth);
  drawFooter(doc, pageWidth, pageHeight);

  doc.save(`Facture-${order.reference}.pdf`);
};
