import { TabsContent } from "@radix-ui/react-tabs";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getConlangById, getPublicConlangs } from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { Grammar } from "../_components/grammar/grammar";
import { Lexicon } from "../_components/lexicon/lexicon";

export type LanguagePageSearchParams = {
  view?: string;
  word?: string;
  edit?: string;
  q?: string;
  grammar?: string;
  category?: string;
};

function constructTabUrl(
  conlangId: number,
  tab: string,
  currentParams: LanguagePageSearchParams,
) {
  const params = new URLSearchParams();

  // Preserve all existing params except 'view'
  Object.entries(currentParams).forEach(([key, value]) => {
    if (key !== "view" && value !== undefined) {
      params.set(key, value);
    }
  });

  // Set the new view parameter
  params.set("view", tab);

  return `/lang/${conlangId}/?${params.toString()}`;
}

interface LanguageTabsProps {
  conlang: Conlang;
  selectedTab?: string;
  wordId?: number;
  searchParams: LanguagePageSearchParams;
}

function LanguageTabs({
  conlang,
  selectedTab = "lexicon",
  wordId,
  searchParams,
}: LanguageTabsProps) {
  return (
    <Tabs value={selectedTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="lexicon" className="p-0">
          <Link
            href={constructTabUrl(conlang.id, "lexicon", searchParams)}
            className="h-full w-full px-3 py-1.5"
          >
            Lexicon
          </Link>
        </TabsTrigger>
        <TabsTrigger value="phonology" className="p-0">
          <Link
            href={constructTabUrl(conlang.id, "phonology", searchParams)}
            className="h-full w-full px-3 py-1.5"
          >
            Phonology
          </Link>
        </TabsTrigger>
        <TabsTrigger value="grammar" className="p-0">
          <Link
            href={constructTabUrl(conlang.id, "grammar", searchParams)}
            className="h-full w-full px-3 py-1.5"
          >
            Grammar
          </Link>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="lexicon">
        <div className="my-2">
          <Lexicon
            conlang={conlang}
            wordId={wordId}
            searchParams={searchParams}
          />
        </div>
      </TabsContent>
      <TabsContent value="phonology">
        <div className="my-2">Phonology (coming soon)</div>
      </TabsContent>
      <TabsContent value="grammar">
        <div className="my-2">
          <Grammar conlang={conlang} searchParams={searchParams} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

interface LanguagePageProps {
  params: { id: string };
  searchParams: LanguagePageSearchParams;
}

export default async function LanguagePage({
  params,
  searchParams,
}: LanguagePageProps) {
  const conlangId = Number(params.id);
  let conlang;
  try {
    // Skip auth for static generation (only looks at public conlangs)
    conlang = await getConlangById(conlangId, { skipAuth: true });
    if (!conlang.isPublic) {
      // Enforce auth for non-public conlangs
      conlang = await getConlangById(conlangId, { skipAuth: false });
    }
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-5 text-center">Language not found.</div>;
  }
  return (
    <div className="flex flex-col">
      <div className="my-3 flex items-center gap-4 font-semibold">
        <h1 className="text-2xl md:text-3xl">{conlang.name}</h1>
      </div>
      <div className="my-1">
        <LanguageTabs
          conlang={conlang}
          selectedTab={searchParams.view}
          wordId={Number(searchParams.word) ?? undefined}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const conlangs = await getPublicConlangs();
  return conlangs.map((conlang) => ({
    id: conlang.id.toString(),
  }));
}
