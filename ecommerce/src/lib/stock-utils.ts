import { Prisma } from "@prisma/client";

export async function reduceOrderStock(
  orderId: string,
  tx: Prisma.TransactionClient,
) {
  console.log(`[reduceOrderStock] Starting for order ${orderId}`);
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    console.log(`[reduceOrderStock] Order ${orderId} not found`);
    return;
  }

  if (order.stockReduced) {
    console.log(
      `[reduceOrderStock] Stock already reduced for order ${order.reference}`,
    );
    return;
  }

  console.log(
    `[reduceOrderStock] Reducing stock for ${order.items.length} items`,
  );

  for (const item of order.items) {
    
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { id: true, stock: true, name: true },
    });

    if (!product) {
      console.warn(`[reduceOrderStock] Product ${item.productId} not found`);
      continue;
    }

    const previousStock = product.stock;
    const newStock = previousStock - item.quantity;
    console.log(
      `[reduceOrderStock] Product ${product.name}: ${previousStock} -> ${newStock}`,
    );

    await tx.product.update({
      where: { id: item.productId },
      data: { stock: newStock },
    });

    
    if (item.productImageId) {
      
      const img = await tx.productImage.findUnique({
        where: { id: item.productImageId },
      });

      if (img && img.stock !== null) {
        const imgPrevStock = img.stock;
        const imgNewStock = imgPrevStock - item.quantity;
        console.log(
          `[reduceOrderStock] ProductImage ${img.id} (${img.reference || img.color || "default"}): ${imgPrevStock} -> ${imgNewStock}`,
        );
        await tx.productImage.update({
          where: { id: img.id },
          data: { stock: imgNewStock },
        });

        
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            productImageId: img.id,
            type: "ORDER",
            quantity: -item.quantity,
            previousStock: imgPrevStock,
            newStock: imgNewStock,
            reason: `Finalisation commande ${order.reference}`,
            note: `Vente effectuée - Réf: ${img.reference || img.color || "Standard"}`,
          },
        });
      }
    } else {
      
      const productImages = await tx.productImage.findMany({
        where: { productId: item.productId, stock: { not: null } },
        orderBy: { id: "asc" },
      });

      for (const img of productImages) {
        if (img.stock && img.stock >= item.quantity) {
          const imgPrevStock = img.stock;
          const imgNewStock = imgPrevStock - item.quantity;
          console.log(
            `[reduceOrderStock] ProductImage ${img.id} (${img.color || "default"}) [fallback]: ${imgPrevStock} -> ${imgNewStock}`,
          );
          await tx.productImage.update({
            where: { id: img.id },
            data: { stock: imgNewStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              productImageId: img.id,
              type: "ORDER",
              quantity: -item.quantity,
              previousStock: imgPrevStock,
              newStock: imgNewStock,
              reason: `Finalisation commande ${order.reference}`,
              note: `Vente effectuée - Couleur: ${img.color || "Standard"}`,
            },
          });
          break;
        }
      }
    }

    
    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        type: "ORDER",
        quantity: -item.quantity,
        previousStock,
        newStock,
        reason: `Finalisation commande ${order.reference}`,
        note: `Vente effectuée - Statut: ${order.status}`,
      },
    });
  }

  await tx.order.update({
    where: { id: orderId },
    data: { stockReduced: true },
  });
  console.log(`[reduceOrderStock] Completed for order ${order.reference}`);
}

export async function replenishOrderStock(
  orderId: string,
  tx: Prisma.TransactionClient,
) {
  console.log(`[replenishOrderStock] Starting for order ${orderId}`);
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || !order.stockReduced) {
    console.log(`[replenishOrderStock] Order not found or stock not reduced`);
    return;
  }

  for (const item of order.items) {
    
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { id: true, stock: true, name: true },
    });

    if (!product) continue;

    const previousStock = product.stock;
    const newStock = previousStock + item.quantity;
    console.log(
      `[replenishOrderStock] Product ${product.name}: ${previousStock} -> ${newStock}`,
    );

    await tx.product.update({
      where: { id: item.productId },
      data: { stock: newStock },
    });

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        type: "RETURN",
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: `Annulation commande ${order.reference}`,
        note: `Stock réintégré suite à annulation`,
      },
    });

    
    const imgMovements = await tx.stockMovement.findMany({
      where: {
        productId: item.productId,
        productImageId: { not: null },
        reason: { contains: order.reference },
        type: "ORDER",
      },
    });

    for (const movement of imgMovements) {
      if (movement.productImageId) {
        const img = await tx.productImage.findUnique({
          where: { id: movement.productImageId },
        });
        if (img && img.stock !== null) {
          const imgPrevStock = img.stock;
          const imgNewStock = imgPrevStock + Math.abs(movement.quantity);
          console.log(
            `[replenishOrderStock] ProductImage ${img.id}: ${imgPrevStock} -> ${imgNewStock}`,
          );
          await tx.productImage.update({
            where: { id: img.id },
            data: { stock: imgNewStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              productImageId: img.id,
              type: "RETURN",
              quantity: Math.abs(movement.quantity),
              previousStock: imgPrevStock,
              newStock: imgNewStock,
              reason: `Annulation commande ${order.reference}`,
              note: `Stock image réintégré`,
            },
          });
        }
      }
    }
  }

  await tx.order.update({
    where: { id: orderId },
    data: { stockReduced: false },
  });
  console.log(`[replenishOrderStock] Completed for order ${order.reference}`);
}
