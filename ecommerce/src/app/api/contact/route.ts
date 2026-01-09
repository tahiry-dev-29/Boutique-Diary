import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/types/contact";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = contactFormSchema.parse(body);

    // 1. SAVE TO DATABASE (Always Priority)
    try {
      await prisma.contactMessage.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          message: validatedData.message,
          status: "UNREAD",
        },
      });
      console.log("✅ Message saved to database");
    } catch (dbError) {
      console.error("❌ Database Error:", dbError);
      // We throw to trigger the main catch block and return 500
      throw dbError;
    }

    // 2. SEND EMAIL (Optional / Best Effort)
    // MOCK MODE: If no SMTP settings are present, just log
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log(
        "⚠️ MOCK EMAIL MODE - No SMTP credentials found. Skipping email send."
      );
      // No delay needed, DB save is enough confirmation
    } else {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.CONTACT_EMAIL || "contact@boutique-diary.fr",
          subject: `Nouveau message de: ${validatedData.name}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #3d6b6b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .field { margin-bottom: 20px; }
                  .label { font-weight: bold; color: #3d6b6b; display: block; margin-bottom: 5px; }
                  .value { background-color: white; padding: 10px; border-radius: 4px; border-left: 3px solid #3d6b6b; }
                  .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Nouveau Message de Contact</h1>
                  </div>
                  <div class="content">
                    <div class="field">
                      <span class="label">Nom:</span>
                      <div class="value">${validatedData.name}</div>
                    </div>
                    <div class="field">
                      <span class="label">Email:</span>
                      <div class="value"><a href="mailto:${validatedData.email}">${validatedData.email}</a></div>
                    </div>
                    ${
                      validatedData.phone
                        ? `
                    <div class="field">
                      <span class="label">Téléphone:</span>
                      <div class="value"><a href="tel:${validatedData.phone}">${validatedData.phone}</a></div>
                    </div>
                    `
                        : ""
                    }
                    <div class="field">
                      <span class="label">Message:</span>
                      <div class="value">${validatedData.message.replace(/\n/g, "<br>")}</div>
                    </div>
                  </div>
                  <div class="footer">
                    <p>Ce message a été envoyé depuis le formulaire de contact de Boutique Diary</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `
    Nouveau message de contact

    Nom: ${validatedData.name}
    Email: ${validatedData.email}
    ${validatedData.phone ? `Téléphone: ${validatedData.phone}` : ""}

    Message:
    ${validatedData.message}
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email notification sent");
      } catch (emailError) {
        console.error("❌ Failed to send email notification:", emailError);
        // We do NOT return error here, because DB save succeeded.
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message envoyé et enregistré avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de l'envoi du message",
      },
      { status: 500 }
    );
  }
}
