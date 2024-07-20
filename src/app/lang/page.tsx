import { getPublicConlangs } from "~/server/queries";
import { LanguageSearch } from "./_components/language-search";

export default async function LanguagesPage() {
  let languages = [];
  try {
    languages = await getPublicConlangs();
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-5 text-center">Error loading languages.</div>;
  }
  return (
    <div className="container my-10">
      <LanguageSearch languages={languages} />
    </div>
  );
}
