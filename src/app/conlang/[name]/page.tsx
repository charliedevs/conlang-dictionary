interface ConlangPageProps {
  params: { name: string };
}

export default function ConlangPage({ params }: ConlangPageProps) {
  // TODO: fetch conlang data from database
  return (
    <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
      <h1 className="text-center text-2xl font-medium">{params.name}</h1>
      <p>Description here</p>
    </div>
  );
}
