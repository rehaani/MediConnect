import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
