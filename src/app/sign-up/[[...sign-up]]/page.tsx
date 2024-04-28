import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="mt-8 flex items-center justify-center md:mt-24">
      <SignUp />
    </div>
  );
}
