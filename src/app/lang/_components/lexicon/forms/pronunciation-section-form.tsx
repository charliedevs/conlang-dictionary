"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, InfoIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { TextEditor } from "~/components/text-editor";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useIPAReaderHealth } from "~/hooks/data/useIPAReaderHealth";
import useIsMobile from "~/hooks/responsiveness/useIsMobile";
import { htmlToMarkdown } from "~/lib/strings";
import { cn, sanitizeHtmlInput } from "~/lib/utils";
import { type Word } from "~/types/word";

const ipaEntrySchema = z.object({
  label: z.string().optional(),
  value: z.string().min(1, "IPA value required").trim(),
});

const pronunciationFormProps = z
  .object({
    title: z.string().optional(),
    pronunciationText: z.string().optional().default(""),
    ipaEntries: z.array(ipaEntrySchema).optional(),
    audioUrl: z.union([
      z.string().trim().url("Invalid URL").optional(),
      z.literal(""),
    ]),
    region: z.string().optional(),
    displayLinkForIPA: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const hasIPA = data.ipaEntries?.some((e) => e.value.trim());
    if (!hasIPA && !data.pronunciationText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either an IPA entry or Pronunciation Text is required.",
        path: ["pronunciationText"],
      });
    }
  });

export type PronunciationSectionFormValues = z.infer<
  typeof pronunciationFormProps
>;

interface PronunciationSectionFormProps {
  word: Word;
  initialValues?: Partial<PronunciationSectionFormValues>;
  mode?: "add" | "edit";
  onSubmit?: (values: PronunciationSectionFormValues) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PronunciationSectionForm({
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
  disabled = false,
}: PronunciationSectionFormProps) {
  const form = useForm<PronunciationSectionFormValues>({
    resolver: zodResolver(pronunciationFormProps),
    defaultValues: {
      title: initialValues.title ?? "",
      pronunciationText: initialValues.pronunciationText ?? "",
      ipaEntries: initialValues.ipaEntries ?? [],
      audioUrl: initialValues.audioUrl ?? "",
      region: initialValues.region ?? "",
      displayLinkForIPA: initialValues.displayLinkForIPA ?? false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ipaEntries",
  });

  function handleAddIPAEntry() {
    const nextLabel = fields.length === 0 ? "IPA" : `IPA ${fields.length + 1}`;
    append({ label: nextLabel, value: "" });
  }

  function handleSubmit(values: PronunciationSectionFormValues) {
    onSubmit?.({
      ...values,
      pronunciationText: htmlToMarkdown(
        sanitizeHtmlInput(values.pronunciationText ?? ""),
      ),
    });
  }

  const isMobile = useIsMobile();
  const ipaReaderIsUp = useIPAReaderHealth();
  const ipaEntries = form.watch("ipaEntries");
  const isCheckboxDisabled =
    disabled || !ipaEntries?.some((e) => e.value.trim());

  const [isAudioExpanded, setIsAudioExpanded] = useState(false);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Pronunciation"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <fieldset className="flex flex-col gap-2 rounded-md border border-muted bg-muted/40 p-4">
          <legend className="mb-2 px-1 text-sm font-semibold text-muted-foreground">
            Content
          </legend>
          <div className="mb-1 text-xs text-muted-foreground">
            You can provide either freeform text, IPA, or both.
          </div>
          <FormField
            control={form.control}
            name="pronunciationText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pronunciation Text</FormLabel>
                <FormControl>
                  <TextEditor
                    {...field}
                    value={field.value}
                    className="min-h-[80px] bg-background"
                    showOrderedList
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <fieldset className="mt-2 flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">IPA Entries</legend>
            <ul>
              {fields.map((field, idx) => (
                <li key={field.id} className="mb-2 flex items-center gap-2">
                  <FormItem className="flex flex-col">
                    <FormLabel
                      className={cn(
                        "text-xs text-muted-foreground",
                        idx > 0 && "sr-only",
                      )}
                    >
                      Label (optional)
                    </FormLabel>
                    <FormControl>
                      <FormField
                        control={form.control}
                        name={`ipaEntries.${idx}.label`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={`IPA${idx === 0 ? "" : ` ${idx + 1}`}`}
                            disabled={disabled}
                          />
                        )}
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="ml-2 flex flex-col">
                    <FormLabel
                      className={cn(
                        "text-xs text-muted-foreground",
                        idx > 0 && "sr-only",
                      )}
                    >
                      IPA
                    </FormLabel>
                    <FormControl>
                      <FormField
                        control={form.control}
                        name={`ipaEntries.${idx}.value`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="e.g. /ˈmaʊ̯̃ʔn̩/"
                            disabled={disabled}
                          />
                        )}
                      />
                    </FormControl>
                  </FormItem>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(idx)}
                    disabled={disabled}
                    className={idx === 0 ? "-mb-5" : ""}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddIPAEntry}
                disabled={disabled}
                className="text-xs"
              >
                <PlusIcon className="size-4 text-green-700" />
                Add IPA Entry
              </Button>
            </div>
            <FormMessage />
          </fieldset>
        </fieldset>
        {/* Audio Playback (Collapsible) */}
        <Collapsible open={isAudioExpanded} onOpenChange={setIsAudioExpanded}>
          <fieldset
            className={cn(
              "flex flex-col gap-4 rounded-md",
              isAudioExpanded && "border border-muted bg-muted/40 p-4",
            )}
          >
            <legend className="mb-2 flex items-center gap-1 px-1 text-sm font-semibold text-muted-foreground">
              Audio Playback
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </legend>
            <CollapsibleContent asChild>
              <>
                {ipaReaderIsUp && (
                  <FormField
                    control={form.control}
                    name="displayLinkForIPA"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-0">
                        <div className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isCheckboxDisabled}
                            />
                          </FormControl>
                          <FormLabel className="mb-0 flex items-center gap-1">
                            Display link for IPA playback?
                            {!isMobile ? (
                              <Tooltip
                                content={
                                  <span>
                                    Shows icon linking to{" "}
                                    <a
                                      href="https://ipa-reader.com"
                                      target="_blank"
                                      className="underline"
                                    >
                                      ipa-reader.com
                                    </a>
                                  </span>
                                }
                                side="right"
                              >
                                <InfoIcon className="inline h-[1em] w-[1em] align-text-bottom text-muted-foreground transition-colors hover:text-primary" />
                              </Tooltip>
                            ) : null}
                          </FormLabel>
                        </div>
                        {isMobile ? (
                          <FormDescription className="!mt-2 flex items-center text-xs text-muted-foreground">
                            <InfoIcon className="inline h-[1em] w-[1em] align-text-bottom" />
                            <span className="!ml-1">
                              Shows icon linking to{" "}
                              <a
                                href="https://ipa-reader.com"
                                target="_blank"
                                className="inline underline"
                              >
                                ipa-reader.com
                              </a>
                            </span>
                          </FormDescription>
                        ) : null}
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="audioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="Paste audio file URL"
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Provide a link to an audio file and an audio player will
                        appear under your word.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            </CollapsibleContent>
          </fieldset>
        </Collapsible>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="default"
            disabled={form.formState.isSubmitting || disabled}
          >
            {mode === "edit" ? "Save Changes" : "Add Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
