"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean().default(false),
});

export function ConlangForm() {
  // Use react-hook-form to handle form submission with zod for validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isPublic: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      .then((res) => res.json())
      .then(() => {
        form.reset();
        setIsSubmitting(false);
        toast.success("Congratulations! Your conlang has been created.");
        router.push("/dashboard");
        router.refresh();
      })
      .catch((err) => {
        console.error("Error:", err);
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
