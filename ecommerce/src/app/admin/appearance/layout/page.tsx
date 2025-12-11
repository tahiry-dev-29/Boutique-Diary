export default function PlaceholderPage() {
  return (
    <div className="flex items-center justify-center h-[50vh] flex-col gap-4">
      <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-3xl">🚧</span>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Page en construction
        </h2>
        <p className="text-gray-500 max-w-md">
          Cette section de l&apos;interface d&apos;administration est en cours
          de développement. Revenez bientôt !
        </p>
      </div>
    </div>
  );
}
