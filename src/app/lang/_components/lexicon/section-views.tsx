import parseHtml from "html-react-parser";
import { IPAReaderLink } from "~/components/ipa-reader-link";
import type { LexicalSection } from "~/types/word";

export function renderSection(section: LexicalSection) {
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

function DefinitionSection({
  section,
}: {
  section: Extract<LexicalSection, { sectionType: "definition" }>;
}) {
  const { title, /* lexicalCategoryId, */ definitionText, examples } =
    section.properties;

  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">
        {title && title.trim() !== "" ? title : "Definition"}
      </h3>
      {definitionText && (
        <div className="prose prose-slate prose-sm dark:prose-invert text-pretty text-sm">
          {parseHtml(definitionText)}
        </div>
      )}
      {Array.isArray(examples) && examples.length > 0 && (
        <ul className="ml-1 pl-1 text-xs italic text-primary/80 sm:text-[0.85rem] md:ml-2 md:p-1 md:pl-2 md:text-sm">
          {examples.map((ex: string, i: number) => (
            <li key={i} className="pb-1">
              {ex}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PronunciationSection({
  section,
}: {
  section: Extract<LexicalSection, { sectionType: "pronunciation" }>;
}) {
  const {
    title,
    ipaEntries,
    audioUrl,
    region,
    pronunciationText,
    displayLinkForIPA,
  } = section.properties;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">
        {title && title.trim() !== "" ? title : "Pronunciation"}
      </h3>
      {pronunciationText && (
        <div className="prose prose-slate prose-sm dark:prose-invert mt-2 text-pretty text-sm">
          {parseHtml(pronunciationText)}
        </div>
      )}
      {ipaEntries &&
        ipaEntries.length > 0 &&
        (ipaEntries.length === 1 ? (
          <div className="mt-2 flex items-baseline gap-1 text-sm">
            <span className="font-semibold text-muted-foreground">
              {ipaEntries?.[0]?.label ?? "IPA"}:
            </span>
            <span className="font-mono">{ipaEntries?.[0]?.value ?? ""}</span>
            {displayLinkForIPA && ipaEntries?.[0]?.value && (
              <span className="-mb-3">
                <IPAReaderLink ipa={ipaEntries[0].value} />
              </span>
            )}
          </div>
        ) : (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {ipaEntries?.map((entry, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">
                  {entry?.label ?? "IPA"}:
                </span>
                <span className="font-mono">{entry?.value ?? ""}</span>
                {displayLinkForIPA && entry?.value && (
                  <IPAReaderLink ipa={entry.value} />
                )}
              </li>
            ))}
          </ul>
        ))}
      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          preload="metadata"
          className="mt-2 text-sm"
        >
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
      <h3 className="mb-2 text-lg font-bold">
        {title && title.trim() !== "" ? title : "Etymology"}
      </h3>
      {etymologyText && (
        <div className="prose prose-slate prose-sm dark:prose-invert text-pretty text-sm">
          {parseHtml(etymologyText)}
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
      <h3 className="mb-2 text-lg font-bold">
        {title && title.trim() !== "" ? title : "Custom Section"}
      </h3>
      {contentText && (
        <div className="prose prose-slate prose-sm dark:prose-invert text-pretty text-sm">
          {parseHtml(contentText)}
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
      <h3 className="mb-2 text-lg font-bold">
        {title && title.trim() !== "" ? title : "Custom Fields"}
      </h3>
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
