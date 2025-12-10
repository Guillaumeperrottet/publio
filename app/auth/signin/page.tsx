import AuthLayout from "@/components/layout/auth-layout";
import SignInForm from "@/features/auth/signin-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirect;

  return (
    <AuthLayout>
      <SignInForm redirectUrl={redirectUrl} />
    </AuthLayout>
  );
}
