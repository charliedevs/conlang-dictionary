import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="mt-8 flex items-center justify-center py-10 md:mt-24">
      <SignUp />
    </div>
  );
}
