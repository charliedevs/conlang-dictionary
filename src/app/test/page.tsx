import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const TestPage = () => {
  if (!auth()) {
    return redirect("/sign-in");
  }

  return <div>Yay you are signed in!</div>;
};

export default TestPage;
