import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="mt-8 flex items-center justify-center py-10 md:mt-24">
      <SignIn />
    </div>
  );
}
