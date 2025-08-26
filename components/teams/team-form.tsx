"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const teamFormSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

type TeamFormProps = {
  onSubmit: (data: FormData) => Promise<{ error?: string } | void>;
  submitButtonText: string;
  defaultValues?: Partial<TeamFormValues>;
};

export function TeamForm({ 
  onSubmit, 
  submitButtonText, 
  defaultValues = {} 
}: TeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      ...defaultValues,
    },
  });

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await onSubmit(formData);
      
      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSubmit(formData);
      }} className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Engineering Team" {...field} />
              </FormControl>
              <FormDescription>
                A clear and descriptive name for your team
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What does this team work on?"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                A brief description of the team's purpose or focus
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submitButtonText}...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
