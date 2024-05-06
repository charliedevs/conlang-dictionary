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
import { type Conlang } from "~/types/conlang";

const formSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Conlang name required."),
  emoji: z
    .string()
    .emoji("Must be a valid emoji.")
    .max(6, "Too many emojis. Calm down.")
    .optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

interface EditConlangFormProps {
  conlang: Conlang;
}

export function EditConlangForm({ conlang }: EditConlangFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: conlang.id,
      name: conlang.name,
      emoji: conlang.emoji ?? undefined,
      description: conlang.description ?? "",
      isPublic: conlang.isPublic,
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
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("Failed to update conlang: " + res.statusText);
        return res.json();
      })
      .then(() => {
        form.reset();
        toast.success("Your conlang has been updated.");
        router.push("/dashboard");
        router.refresh();
      })
      .catch((err) => {
        console.error("Error:", err);
        toast.error("Failed to update conlang. Please try again.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div className="my-10 flex flex-col justify-center">
      <h1 className="mb-5 text-start text-3xl font-bold">Edit your conlang:</h1>
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
                    placeholder="The language of the oppossums."
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
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
}
