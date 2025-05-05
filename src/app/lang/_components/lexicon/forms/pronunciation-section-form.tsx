"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OpenPage } from "~/components/icons/open-page";
import { TextEditor } from "~/components/text-editor";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
import { type Word } from "~/types/word";

const pronunciationFormProps = z
  .object({
    title: z.string().optional(),
    pronunciationText: z.string().optional().default(""),
    ipa: z.string().optional(),
    audioUrl: z.union([
      z.string().trim().url("Invalid URL").optional(),
      z.literal(""),
    ]),
    region: z.string().optional(),
    displayLinkForIPA: z.boolean().optional().default(false),
    //phonemeIds: z.string().optional(), // TODO: Integrate later as Phonology is built out
  })
  .superRefine((data, ctx) => {
    if (!data.ipa?.trim() && !data.pronunciationText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either IPA or Pronunciation Text is required.",
        path: ["ipa"],
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
      ipa: initialValues.ipa ?? "",
      audioUrl: initialValues.audioUrl ?? "",
      region: initialValues.region ?? "",
      displayLinkForIPA: initialValues.displayLinkForIPA ?? false,
    },
  });

  function handleSubmit(values: PronunciationSectionFormValues) {
    onSubmit?.(values);
  }

  const isMobile = useIsMobile();
  const ipaReaderIsUp = useIPAReaderHealth();
  const ipaValue = form.watch("ipa");
  const isCheckboxDisabled = disabled || !ipaValue?.trim();

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
          <FormField
            control={form.control}
            name="ipa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IPA</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. /ˈmaʊ̯̃ʔn̩/"
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription className="group/link">
                  <a
                    href="https://ipa.typeit.org/full/"
                    target="_blank"
                    className="flex items-center justify-end gap-1 text-xs text-blue-600 underline group-hover/link:text-blue-500"
                  >
                    Get IPA symbols
                    <OpenPage className="h-3 w-3 text-primary opacity-70 group-hover/link:opacity-100" />
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <fieldset className="flex flex-col gap-4 rounded-md border border-muted bg-muted/40 p-4">
          <legend className="mb-2 px-1 text-sm font-semibold text-muted-foreground">
            Audio Playback
          </legend>
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
        </fieldset>
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
