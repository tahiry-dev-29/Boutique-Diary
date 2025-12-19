import { format } from "date-fns";
import { fr } from "date-fns/locale";


export interface OrderDetails {
  id: string;
  reference: string;
  customer: { name: string; email: string; address?: string };
  status: string;
  total: number;
  createdAt: Date | string;
  items: Array<{
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    variant?: string;
  }>;
}

export const generateInvoice = (order: OrderDetails) => {
  const popup = window.open("", "_blank", "width=800,height=1000");
  if (!popup) {
    alert("Veuillez autoriser les pop-ups pour générer la facture.");
    return;
  }

  const orderDate = new Date(order.createdAt);
  const formattedDate = format(orderDate, "dd MMMM yyyy", { locale: fr });

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(amount);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Facture #${order.reference}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
          line-height: 1.5;
          margin: 0;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 60px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
        }

        .company-info h1 {
          font-size: 24px;
          margin: 0 0 5px 0;
          color: #111;
        }

        .company-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .invoice-details {
          text-align: right;
        }

        .invoice-details h2 {
          font-size: 32px;
          margin: 0 0 10px 0;
          color: #111;
          letter-spacing: -1px;
        }

        .invoice-details p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .addresses {
          display: flex;
          justify-content: space-between;
          margin-bottom: 60px;
        }

        .address-box {
          width: 45%;
        }

        .address-box h3 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          margin-bottom: 15px;
        }

        .address-box p {
          margin: 0 0 5px 0;
          font-weight: 500;
        }

        .address-box .email {
          color: #666;
          font-weight: 400;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }

        th {
          text-align: left;
          padding: 15px 10px;
          border-bottom: 1px solid #e5e5e5;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
          font-weight: 600;
        }

        td {
          padding: 20px 10px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }

        .col-right {
          text-align: right;
        }

        .total-section {
          width: 300px;
          margin-left: auto;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 14px;
          color: #666;
        }

        .total-row.final {
          border-top: 2px solid #111;
          margin-top: 10px;
          padding-top: 20px;
          font-size: 18px;
          font-weight: 700;
          color: #111;
        }

        .footer {
          margin-top: 80px;
          text-align: center;
          font-size: 12px;
          color: #888;
          border-top: 1px solid #f0f0f0;
          padding-top: 20px;
        }

        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>Boutique Diary</h1>
          <p>contact@boutique-diary.com</p>
          <p>www.boutique-diary.com</p>
        </div>
        <div class="invoice-details">
          <h2>FACTURE</h2>
          <p>#${order.reference}</p>
          <p>${formattedDate}</p>
        </div>
      </div>

      <div class="addresses">
        <div class="address-box">
          <h3>Facturé à</h3>
          <p>${order.customer.name}</p>
          <p class="email">${order.customer.email}</p>
          ${order.customer.address ? `<p>${order.customer.address}</p>` : ""}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="col-right">Quantité</th>
            <th class="col-right">Prix Unitaire</th>
            <th class="col-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              item => `
            <tr>
              <td>
                <div style="font-weight: 500; color: #111;">${item.productName}</div>
                ${item.variant ? `<div style="font-size: 12px; color: #888; margin-top: 4px;">${item.variant}</div>` : ""}
              </td>
              <td class="col-right">x${item.quantity}</td>
              <td class="col-right">${formatMoney(item.price)}</td>
              <td class="col-right">${formatMoney(item.price * item.quantity)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Sous-total</span>
          <span>${formatMoney(order.total)}</span>
        </div>
        <div class="total-row">
          <span>Livraison</span>
          <span>Gratuite</span>
        </div>
        <div class="total-row final">
          <span>Total</span>
          <span>${formatMoney(order.total)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Merci de votre confiance !</p>
      </div>

      <script>
        window.onload = () => {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  popup.document.write(htmlContent);
  popup.document.close();
};
