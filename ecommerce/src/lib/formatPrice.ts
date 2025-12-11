export function formatPrice(price: number): string {
  const roundedPrice = Math.round(price);

  const formattedNumber = roundedPrice
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedNumber} Ar`;
}
