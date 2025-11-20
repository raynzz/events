import LoginForm from '@/components/LoginForm';

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string;
    [key: string]: string | string[] | undefined;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const rawCallback = searchParams?.callbackUrl;

  const callbackUrl =
    typeof rawCallback === 'string' && rawCallback.length > 0
      ? rawCallback
      : '/';

  return <LoginForm callbackUrl={callbackUrl} />;
}
