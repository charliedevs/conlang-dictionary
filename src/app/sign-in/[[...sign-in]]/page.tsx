import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="mt-8 flex items-center justify-center md:mt-24">
      <SignIn />
    </div>
  );
}
