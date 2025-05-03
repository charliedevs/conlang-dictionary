import { Edit2Icon } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getWordById } from "~/server/queries";
import type { LexicalSection, Word } from "~/types/word";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { WordViewEdit } from "./word-view-edit";

function DefinitionSection({
  section,
}: {
  section: Extract<LexicalSection, { sectionType: "definition" }>;
}) {
  const { title, lexicalCategoryId, definitionText, examples } =
    section.properties;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">
        {title ??
          (lexicalCategoryId
            ? `Category ID: ${lexicalCategoryId}`
            : "Definition")}
      </h3>
      {definitionText && (
        <div className="text-pretty text-sm [&_ol]:list-inside [&_ol]:list-decimal">
          <ReactMarkdown>{definitionText}</ReactMarkdown>
        </div>
      )}
      {Array.isArray(examples) && examples.length > 0 && (
        <ol className="m-2 list-decimal pl-2 text-[0.825rem] text-primary/80 sm:text-[0.85rem] md:ml-4 md:p-3 md:pl-4 md:text-sm">
          {examples.map((ex: string, i: number) => (
            <li key={i} className="pb-2">
              {ex}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function PronunciationSection({
  section,
}: {
  section: Extract<LexicalSection, { sectionType: "pronunciation" }>;
}) {
  const { title, ipa, audioUrl, region } = section.properties;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">{title ?? "Pronunciation"}</h3>
      {ipa && (
        <div>
          IPA:{" "}
          <span className="font-mono">
            <ReactMarkdown>{ipa}</ReactMarkdown>
          </span>
        </div>
      )}
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-2">
          Your browser does not support the audio element.
        </audio>
      )}
      {region && <div>Region: {region}</div>}
    </div>
  );
}

function EtymologySection({
  section,
}: {
  section: Extract<LexicalSection, { sectionType: "etymology" }>;
}) {
  const { title, etymologyText } = section.properties;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">{title ?? "Etymology"}</h3>
      {etymologyText && (
        <div className="text-pretty text-sm">
          <ReactMarkdown>{etymologyText}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function CustomTextSection({
  section,
}: {
  section: Extract<LexicalSection, { sectionType: "custom_text" }>;
}) {
  const { title, contentText } = section.properties;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">{title ?? "Custom Section"}</h3>
      {contentText && (
        <div className="text-pretty text-sm">
          <ReactMarkdown>{contentText}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function CustomFieldsSection({
  section,
}: {
  section: Extract<LexicalSection, { sectionType: "custom_fields" }>;
}) {
  const { title, customFields } = section.properties;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">{title ?? "Custom Fields"}</h3>
      <table className="text-sm">
        <tbody>
          {customFields &&
            Object.entries(customFields).map(([key, value]) => (
              <tr key={key}>
                <td className="pr-2 font-semibold">{key}</td>
                <td>{String(value)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function renderSection(section: LexicalSection) {
  switch (section.sectionType) {
    case "definition":
      return <DefinitionSection section={section} />;
    case "pronunciation":
      return <PronunciationSection section={section} />;
    case "etymology":
      return <EtymologySection section={section} />;
    case "custom_text":
      return <CustomTextSection section={section} />;
    case "custom_fields":
      return <CustomFieldsSection section={section} />;
    default:
      return null;
  }
}

export async function WordView(props: {
  wordId: number;
  isConlangOwner: boolean;
  searchParams?: LanguagePageSearchParams;
}) {
  let word: Word;
  try {
    word = await getWordById(props.wordId);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-4 text-center">Error loading word.</div>;
  }

  const isEditMode =
    props.searchParams?.edit === "true" || word.lexicalSections.length === 0;

  const editSearchParams = new URLSearchParams(props.searchParams ?? {});
  editSearchParams.set("edit", "true");

  if (isEditMode) {
    return <WordViewEdit word={word} />;
  }

  return (
    <div id="word" className="flex flex-col gap-1">
      <div id="word-header" className="flex items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          <h2 className="text-2xl font-medium">{word.text}</h2>
          {props.isConlangOwner && !isEditMode && (
            <Link href={`?${editSearchParams.toString()}`}>
              <Button variant="ghost" size="sm" className="h-8">
                <Edit2Icon className="mr-2 h-3 w-3" /> Edit
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Separator />
      <div className="my-2 flex flex-col gap-2">
        {word.lexicalSections.map((section) => (
          <div key={section.id}>{renderSection(section)}</div>
        ))}
      </div>
    </div>
  );
}
