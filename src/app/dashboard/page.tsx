import { getMyConlangs } from "~/server/queries";
import { ConlangForm } from "./_components/conlang-form";

export default async function DashboardPage() {
  // Get user's conlangs
  const conlangs = await getMyConlangs();

  return (
    <div className="mt-8 flex flex-col items-center justify-center md:mt-24">
      <ConlangForm />
      {/* user's current conlangs */}
      <div id="user-conlangs" className="mt-10 flex flex-col justify-center">
        {conlangs.map((conlang) => (
          <div key={conlang.id} className="flex flex-col justify-center">
            {conlang.name}
          </div>
        ))}
      </div>
    </div>
  );
}
