import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceRequestSchema } from "@/lib/schemas";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function NewRequest() {
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof createServiceRequestSchema>>({
    resolver: zodResolver(createServiceRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      serviceType: "repair",
      priority: "medium",
      address: "",
      scheduledAt: "",
    },
  });

  // 🔥 THIS IS THE MAIN CHANGE (Supabase Insert)
  async function onSubmit(values: z.infer<typeof createServiceRequestSchema>) {
    const { error } = await supabase.from("service_requests").insert([
      {
        title: values.title,
        description: values.description,
        status: "pending",
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Failed to save request ❌");
    } else {
      toast.success("Request submitted successfully ✅");
      setLocation("/customer");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Service Request
        </h1>
        <p className="text-slate-500">
          Submit a new request for service, repair, or maintenance.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            Please provide as much detail as possible to help our technicians.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* TITLE */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., RO filter replacement needed"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SERVICE TYPE */}
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="installation">
                          Installation
                        </SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="maintenance">
                          Maintenance
                        </SelectItem>
                        <SelectItem value="inspection">
                          Inspection
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PRIORITY */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPTION */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the issue in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ADDRESS */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full address for the visit"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DATE */}
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setLocation("/customer")}
                >
                  Cancel
                </Button>

                <Button type="submit" className="bg-teal-700 hover:bg-teal-800">
                  Submit Request
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}