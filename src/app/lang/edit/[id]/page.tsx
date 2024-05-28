import { notFound } from "next/navigation";

import { EditConlangForm } from "~/app/dashboard/_components/edit-conlang-form";
import { getConlangById } from "~/server/queries";

interface EditConlangPageProps {
  params: { id: string };
}

export default async function EditConlangPage({
  params,
}: EditConlangPageProps) {
  const conlangId = Number(params.id);

  let conlang: Awaited<ReturnType<typeof getConlangById>>;
  try {
    conlang = await getConlangById(conlangId);
  } catch (error) {
    notFound();
  }

  if (!conlang) notFound();

  return (
    <div className="mt-8 flex flex-col items-center justify-center md:mt-24">
      <EditConlangForm conlang={conlang} />
    </div>
  );
}
