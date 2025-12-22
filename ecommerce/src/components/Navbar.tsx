"use client";

import StoreNavbar from "./store/StoreNavbar";

export default function Navbar({ categories = [] }: { categories?: any[] }) {
  return <StoreNavbar categories={categories} />;
}
