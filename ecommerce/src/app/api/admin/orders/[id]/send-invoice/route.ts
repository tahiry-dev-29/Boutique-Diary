import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/email";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            username: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        transactions: {
          take: 1,
          select: { metadata: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const metadata = order.transactions[0]?.metadata as Record<string, string>;
    const customerEmail = order.customer?.email || metadata?.email;
    const customerName =
      order.customer?.username || metadata?.mvolaName || "Client";

    if (!customerEmail) {
      return NextResponse.json(
        {
          error:
            "Email du client non trouvé. Veuillez vérifier les informations de la commande.",
        },
        { status: 400 },
      );
    }

    const formatMoney = (amount: number) =>
      new Intl.NumberFormat("fr-MG", {
        style: "currency",
        currency: "MGA",
        maximumFractionDigits: 0,
      }).format(amount);

    const orderDate = format(order.createdAt, "dd MMMM yyyy", { locale: fr });

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
          .header { background-color: #111827; padding: 40px 20px; text-align: center; color: #ffffff; }
          .logo { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
          .logo span { color: #d4a373; font-style: italic; }
          .tagline { font-size: 14px; opacity: 0.7; letter-spacing: 1px; }
          .content { padding: 40px; }
          .invoice-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
          .invoice-title { font-size: 24px; font-weight: 800; color: #111827; margin: 0; }
          .invoice-ref { color: #d4a373; font-family: monospace; font-weight: bold; }
          .section-title { font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .info-block p { margin: 4px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 12px 10px; border-bottom: 2px solid #f3f4f6; color: #6b7280; font-size: 11px; text-transform: uppercase; font-weight: 700; }
          td { padding: 16px 10px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
          .price-col { text-align: right; }
          .total-section { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .grand-total { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px; font-size: 20px; font-weight: 800; color: #111827; }
          .footer { text-align: center; padding: 30px; background-color: #f9fafb; color: #9ca3af; font-size: 12px; }
          .button { display: inline-block; padding: 14px 28px; background-color: #d4a373; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Boutique <span>Diary</span></div>
            <div class="tagline">VOTRE BOUTIQUE DE CONFIANCE</div>
          </div>
          
          <div class="content">
            <div style="margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 20px;">Bonjour ${customerName},</h2>
              <p style="color: #4b5563;">Merci pour votre achat ! Voici la facture détaillée de votre commande.</p>
            </div>

            <div style="border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 20px;">
              <span style="font-size: 24px; font-weight: 800;">FACTURE</span>
              <span style="float: right; color: #d4a373; font-weight: 800; font-family: monospace; font-size: 18px;">#${order.reference}</span>
            </div>
            
            <div style="margin-bottom: 30px;">
              <div class="section-title">Informations de livraison</div>
              <p style="margin: 0; font-weight: 600;">${customerName}</p>
              <p style="margin: 2px 0; font-size: 14px; color: #4b5563;">${customerEmail}</p>
              <p style="margin: 2px 0; font-size: 14px; color: #4b5563;">Date: ${orderDate}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th style="text-align: center;">Qté</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    item => `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${item.product.name}</div>
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right; font-weight: 600;">${formatMoney(item.price * item.quantity)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="total-section">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Sous-total</span>
                <span style="font-weight: 600;">${formatMoney(order.total)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Livraison</span>
                <span style="color: #10b981; font-weight: 600;">Gratuite</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 20px; font-weight: 800;">
                <span>TOTAL</span>
                <span style="color: #111827;">${formatMoney(order.total)}</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 40px;">
              <p style="font-size: 14px; color: #6b7280;">Vous pouvez consulter le statut de votre commande en direct sur notre site.</p>
              <a href="${process.env.NEXT_PUBLIC_URL || "https://boutique-diary.mg"}/dashboard/customer/orders" class="button">Suivre ma commande</a>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Boutique Diary - Madagascar</p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter à contact@boutique-diary.mg</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Boutique Diary" <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      subject: `Facture #${order.reference} - Boutique Diary`,
      html: invoiceHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Facture envoyée à ${customerEmail}`,
    });
  } catch (error) {
    console.error("Send invoice error:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 },
    );
  }
}
