import { Prisma } from "@prisma/client";

/**
 * Ratio de conversion pour les points de fidélité.
 * Par défaut : 1 point pour chaque 1000 Ar dépensés.
 */
export const POINTS_CONVERSION_RATE = 1000;

/**
 * Calcule et récompense un client avec des points de fidélité pour sa commande.
 * Condition: La commande doit être finalisée/confirmée.
 */
export async function rewardPointsForOrder(
  orderId: string,
  tx: Prisma.TransactionClient,
) {
  console.log(`[rewardPointsForOrder] Checking order ${orderId}`);

  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      total: true,
      customerId: true,
      pointsRewarded: true,
      reference: true,
    },
  });

  if (!order) {
    console.error(`[rewardPointsForOrder] Order ${orderId} not found`);
    return;
  }

  // Si pas de client ou points déjà récompensés, on ignore
  if (!order.customerId || order.pointsRewarded) {
    console.log(
      `[rewardPointsForOrder] Skipping: customerId=${order.customerId}, alreadyRewarded=${order.pointsRewarded}`,
    );
    return;
  }

  // Calcul des points (Ar -> Points)
  // On arrondit à l'entier inférieur pour être prudent
  const pointsToEarn = Math.floor(order.total / POINTS_CONVERSION_RATE);

  if (pointsToEarn <= 0) {
    console.log(`[rewardPointsForOrder] Order total too low to earn points`);
    return;
  }

  console.log(
    `[rewardPointsForOrder] Rewarding ${pointsToEarn} points to user ${order.customerId} for order ${order.reference}`,
  );

  // 1. Mettre à jour les points de l'utilisateur
  await tx.user.update({
    where: { id: order.customerId },
    data: {
      points: {
        increment: pointsToEarn,
      },
    },
  });

  // 2. Marquer la commande comme ayant récompensé les points
  await tx.order.update({
    where: { id: orderId },
    data: {
      pointsRewarded: true,
    },
  });

  return pointsToEarn;
}
