import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// --- Interfaces ---
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
    productImage: string | null; // URL de l'image
    quantity: number;
    price: number;
    variant?: string;
  }>;
}

// --- Constants & Config ---
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
    link: "#2563eb",
  },
  layout: {
    marginX: 20,
    lineHeight: 7,
  },
  fonts: {
    main: "helvetica",
  },
};

export class InvoiceGeneratorService {
  // --- Public Method ---
  static async generate(order: InvoiceData): Promise<void> {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Header & Info
    this.drawHeader(doc, pageWidth);
    this.drawInvoiceDetails(doc, order, pageWidth);
    this.drawCustomerSection(doc, order.customer, 65, pageWidth);

    // 2. Table (Async car on charge les images)
    const tableEndY = await this.drawTable(doc, order.items, 110, pageWidth);

    // 3. Totals & Footer
    this.drawTotals(doc, order.total, tableEndY, pageWidth);
    this.drawFooter(doc, pageWidth, pageHeight);

    // 4. Output
    // Ouverture dans un nouvel onglet (UX: Preview avant download)
    window.open(doc.output("bloburl"), "_blank");
    // Ou sauvegarde directe: doc.save(`Facture-${order.reference}.pdf`);
  }

  // --- Helpers ---

  private static formatMoney(amount: number): string {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Helper pour charger une image en base64 depuis une URL
  private static async loadImageBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("Impossible de charger l'image produit:", url);
      return null;
    }
  }

  // --- Draw Methods ---

  private static drawStatusBadge(
    doc: jsPDF,
    status: string,
    x: number,
    y: number,
  ) {
    const statusConfig: Record<string, { text: string; color: string }> = {
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
  }

  private static drawHeader(doc: jsPDF, pageWidth: number) {
    // Bandeau supérieur
    doc.setFillColor(STYLE.colors.primary);
    doc.rect(0, 0, pageWidth, 5, "F");

    // Logo / Titre
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
  }

  private static drawInvoiceDetails(
    doc: jsPDF,
    order: InvoiceData,
    pageWidth: number,
  ) {
    const rightX = pageWidth - STYLE.layout.marginX;
    const date = format(new Date(order.createdAt), "dd MMM yyyy", {
      locale: fr,
    });

    doc.setFontSize(22);
    doc.setTextColor(STYLE.colors.text.dark);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.text("FACTURE", rightX, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(STYLE.colors.text.medium);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.text(`# ${order.reference}`, rightX, 32, { align: "right" });

    doc.setFont(STYLE.fonts.main, "normal");
    doc.setTextColor(STYLE.colors.text.light);
    doc.text(`Émise le : ${date}`, rightX, 37, { align: "right" });

    this.drawStatusBadge(doc, order.status, rightX, 45);
  }

  private static drawCustomerSection(
    doc: jsPDF,
    customer: InvoiceData["customer"],
    startY: number,
    pageWidth: number,
  ) {
    // Ligne de séparation subtile
    doc.setDrawColor(STYLE.colors.border);
    doc.line(
      STYLE.layout.marginX,
      startY - 10,
      pageWidth - STYLE.layout.marginX,
      startY - 10,
    );

    // Destinataire
    doc.setFontSize(9);
    doc.setTextColor(STYLE.colors.text.light);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.text("FACTURÉ À", STYLE.layout.marginX, startY);

    doc.setFontSize(11);
    doc.setTextColor(STYLE.colors.text.dark);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.text(customer.name, STYLE.layout.marginX, startY + 7);

    doc.setFont(STYLE.fonts.main, "normal");
    doc.setTextColor(STYLE.colors.text.medium);
    doc.text(customer.email, STYLE.layout.marginX, startY + 13);

    if (customer.address) {
      const addressLines = doc.splitTextToSize(customer.address, 90);
      doc.text(addressLines, STYLE.layout.marginX, startY + 19);
    }

    // Émetteur
    const rightX = pageWidth - STYLE.layout.marginX;
    doc.setFontSize(9);
    doc.setTextColor(STYLE.colors.text.light);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.text("ÉMIS PAR", rightX, startY, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(STYLE.colors.text.dark);
    doc.text("Boutique Diary", rightX, startY + 7, { align: "right" });
    doc.setFont(STYLE.fonts.main, "normal");
    doc.text("Antananarivo, Madagascar", rightX, startY + 13, {
      align: "right",
    });

    // UX Care: Lien cliquable
    doc.setTextColor(STYLE.colors.link);
    doc.textWithLink("contact@boutique-diary.mg", rightX - 45, startY + 19, {
      url: "mailto:contact@boutique-diary.mg",
    });
  }

  private static async drawTable(
    doc: jsPDF,
    items: InvoiceData["items"],
    startY: number,
    pageWidth: number,
  ): Promise<number> {
    let yPos = startY;
    const rightX = pageWidth - STYLE.layout.marginX;
    const tableWidth = pageWidth - STYLE.layout.marginX * 2;
    const rowHeight = 16; // Plus haut pour accueillir l'image

    // --- Table Header ---
    doc.setFillColor(STYLE.colors.text.dark);
    doc.roundedRect(STYLE.layout.marginX, yPos - 8, tableWidth, 10, 1, 1, "F");

    doc.setFontSize(8);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.setTextColor(STYLE.colors.white);

    doc.text("PRODUIT", STYLE.layout.marginX + 4, yPos - 2);
    doc.text("QTE", pageWidth - 80, yPos - 2);
    doc.text("PRIX", pageWidth - 55, yPos - 2);
    doc.text("TOTAL", rightX - 4, yPos - 2, { align: "right" });

    yPos += 5;

    // --- Table Body ---
    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      // Zebra striping
      if (index % 2 === 0) {
        doc.setFillColor(STYLE.colors.tableStripe);
        doc.rect(STYLE.layout.marginX, yPos - 5, tableWidth, rowHeight, "F");
      }

      // 1. Image du produit (UX Care: Visuel)
      if (item.productImage) {
        const base64Img = await this.loadImageBase64(item.productImage);
        if (base64Img) {
          // Image carrée avec un léger padding
          try {
            doc.addImage(
              base64Img,
              "JPEG",
              STYLE.layout.marginX + 2,
              yPos - 3,
              10,
              10,
            );
          } catch (e) {
            // Fallback si format non supporté
          }
        }
      }

      // 2. Textes
      doc.setFontSize(9);
      doc.setTextColor(STYLE.colors.text.dark);
      doc.setFont(STYLE.fonts.main, "medium");

      // Décalage du texte produit à cause de l'image (X + 16mm)
      const textX = STYLE.layout.marginX + 16;
      doc.text(item.productName, textX, yPos + 3);

      if (item.variant) {
        doc.setFontSize(8);
        doc.setTextColor(STYLE.colors.text.light);
        doc.text(item.variant, textX, yPos + 8);
        doc.setTextColor(STYLE.colors.text.dark);
        doc.setFontSize(9);
      }

      doc.text(`${item.quantity}`, pageWidth - 77, yPos + 3);
      doc.text(this.formatMoney(item.price), pageWidth - 55, yPos + 3);

      doc.setFont(STYLE.fonts.main, "bold");
      doc.text(
        this.formatMoney(item.price * item.quantity),
        rightX - 4,
        yPos + 3,
        {
          align: "right",
        },
      );
      doc.setFont(STYLE.fonts.main, "normal");

      yPos += rowHeight;
    }

    return yPos;
  }

  private static drawTotals(
    doc: jsPDF,
    total: number,
    startY: number,
    pageWidth: number,
  ) {
    let yPos = startY + 5;
    const rightX = pageWidth - STYLE.layout.marginX;
    const labelX = pageWidth - 80;

    // Ligne fine au dessus des totaux
    doc.setDrawColor(STYLE.colors.border);
    doc.line(labelX - 10, yPos - 5, rightX, yPos - 5);

    doc.setFontSize(10);
    doc.setTextColor(STYLE.colors.text.medium);
    doc.text("Sous-total", labelX, yPos);
    doc.text(this.formatMoney(total), rightX, yPos, { align: "right" });

    yPos += 8;
    doc.text("Livraison", labelX, yPos);
    doc.setTextColor(STYLE.colors.primary);
    doc.text("Offerte", rightX, yPos, { align: "right" });

    yPos += 12;

    // Fond coloré pour le Total final (Mise en valeur)
    doc.setFillColor(STYLE.colors.secondary);
    doc.roundedRect(
      labelX - 10,
      yPos - 8,
      rightX - (labelX - 10) + 5,
      14,
      1,
      1,
      "F",
    );

    doc.setFontSize(12);
    doc.setTextColor(STYLE.colors.text.dark);
    doc.setFont(STYLE.fonts.main, "bold");
    doc.text("TOTAL NET", labelX - 5, yPos);
    doc.text(this.formatMoney(total), rightX, yPos, { align: "right" });
  }

  private static drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
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

    doc.text("Merci pour votre confiance !", pageWidth / 2, footerY + 8, {
      align: "center",
    });

    // UX Care: Lien vers le site web
    doc.setTextColor(STYLE.colors.link);
    doc.textWithLink("www.boutique-diary.mg", pageWidth / 2, footerY + 13, {
      align: "center",
      url: "https://www.boutique-diary.mg",
    });
  }
}
