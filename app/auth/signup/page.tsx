import AuthLayout from "@/components/layout/auth-layout";
import SignUpForm from "@/features/auth/signup-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirect;

  return (
    <AuthLayout>
      <SignUpForm redirectUrl={redirectUrl} />
    </AuthLayout>
  );
}
