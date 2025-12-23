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
          body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #d4a373; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #1f2937; }
          .logo span { color: #d4a373; font-style: italic; }
          .invoice-title { font-size: 24px; color: #111; margin: 20px 0 10px; }
          .info { margin-bottom: 30px; }
          .info p { margin: 5px 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { text-align: left; padding: 12px 8px; border-bottom: 1px solid #e5e5e5; color: #666; font-size: 12px; text-transform: uppercase; }
          td { padding: 15px 8px; border-bottom: 1px solid #f0f0f0; }
          .text-right { text-align: right; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Boutique <span>Diary</span></div>
          <p style="color: #888; font-size: 12px; margin-top: 5px;">Votre boutique de confiance</p>
        </div>
        
        <h2 class="invoice-title">Facture #${order.reference}</h2>
        
        <div class="info">
          <p><strong>Date :</strong> ${orderDate}</p>
          <p><strong>Client :</strong> ${customerName}</p>
          <p><strong>Email :</strong> ${customerEmail}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qté</th>
              <th class="text-right">Prix</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                item => `
              <tr>
                <td>${item.product.name}</td>
                <td class="text-right">x${item.quantity}</td>
                <td class="text-right">${formatMoney(item.price)}</td>
                <td class="text-right">${formatMoney(item.price * item.quantity)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="total">
          Total : ${formatMoney(order.total)}
        </div>
        
        <div class="footer">
          <p>Merci pour votre confiance !</p>
          <p>Boutique Diary - contact@boutique-diary.mg</p>
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
