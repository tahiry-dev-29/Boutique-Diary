/**
 * Formate un prix en Ariary avec séparateur de milliers
 * @param price - Le prix à formater
 * @returns Le prix formaté (ex: "2.000 Ar")
 */
export function formatPrice(price: number): string {
  // Arrondir à l'entier le plus proche (Ariary n'a pas de centimes)
  const roundedPrice = Math.round(price);

  // Formater avec des points comme séparateurs de milliers
  const formattedNumber = roundedPrice
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedNumber} Ar`;
}
