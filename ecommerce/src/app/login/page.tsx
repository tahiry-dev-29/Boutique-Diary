// ecommerce/src/app/login/page.tsx
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Se connecter</h1>
        <LoginForm />
      </div>
    </div>
  );
}
