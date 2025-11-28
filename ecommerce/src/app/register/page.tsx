// ecommerce/src/app/register/page.tsx
import RegisterForm from "../../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">S&apos;inscrire</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
