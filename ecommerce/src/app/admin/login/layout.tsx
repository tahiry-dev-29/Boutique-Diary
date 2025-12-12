export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout overrides the admin layout to show login page without sidebar
  return <>{children}</>;
}
