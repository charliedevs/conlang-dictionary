import { redirect } from "next/navigation";
import { createLocalUser } from "~/app/sign-up/_actions/create-user";

export default async function OnboardingPage() {
  try {
    // Create the local user record
    await createLocalUser();

    // Redirect to dashboard or home page after successful creation
    redirect("/");
  } catch (error) {
    // If there's an error, you may want to handle it differently
    console.error("Failed to create local user:", error);
    return <div>Something went wrong. Please try again.</div>;
  }
}
