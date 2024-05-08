"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FaceSmile } from "~/components/icons/face-smile";
import { Button } from "~/components/ui/button";
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
import { Switch } from "~/components/ui/switch";
import {
  handleApiErrorResponse,
  isApiError,
} from "~/utils/client-error-handler";

const formSchema = z.object({
  name: z.string().min(1, "Conlang name required."),
  emoji: z
    .string()
    .emoji("Must be a valid emoji.")
    .max(6, "Too many emojis. Calm down.")
    .optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export function NewConlangForm() {
  // Use react-hook-form to handle form submission with zod for validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      emoji: undefined,
      description: "",
      isPublic: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle emoji input
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const handleEmojiClick = (emojiData: EmojiClickData, _e: MouseEvent) => {
    form.setValue("emoji", emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const router = useRouter();
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    fetch("/api/conlang", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) {
          return handleApiErrorResponse(res);
        }
        return res.json();
      })
      .then(() => {
        form.reset();
        toast.success("Congratulations! Your conlang has been created.");
        router.push("/dashboard");
        router.refresh();
      })
      .catch((err) => {
        console.error("Error:", err);
        if (isApiError(err) && err.code === "DUPLICATE_CONLANG_NAME") {
          toast.error("A conlang with this name already exists.");
          form.setError("name", {
            type: "manual",
            message: "A conlang with this name already exists.",
          });
        } else if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("Failed to create conlang. Please try again.");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div className="my-10 flex flex-col justify-center">
      <h1 className="mb-5 text-start text-3xl font-bold">
        Create a new conlang:
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col justify-center space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Tpaalha" {...field} />
                </FormControl>
                <FormDescription>The name of your conlang.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="The language of the opossums."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A short description of your language.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Emoji</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder=""
                      buttonContents={<FaceSmile />}
                      onButtonClick={() => setShowEmojiPicker((prev) => !prev)}
                    />
                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute right-0 z-50"
                      >
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  This will appear next to your language name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="item-center flex flex-row justify-between rounded-lg border p-4">
                <div className="space-y-0.5 pr-5">
                  <FormLabel>Make it public?</FormLabel>
                  <FormDescription>
                    Allow anyone to view your conlang.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
}
