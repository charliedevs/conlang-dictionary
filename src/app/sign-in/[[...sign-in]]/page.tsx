import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="mt-8 flex items-center justify-center md:mt-24">
      <SignIn />
    </div>
  );
};

export default SignInPage;
