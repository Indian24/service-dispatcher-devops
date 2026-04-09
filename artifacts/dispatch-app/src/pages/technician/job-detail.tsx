import { useGetServiceRequest, getGetServiceRequestQueryKey, useUpdateServiceRequest } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Clock, MapPin, User, FileText, CheckCircle2 } from "lucide-react";
import { StatusBadge, PriorityBadge, ServiceTypeBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function JobDetail() {
  const { id } = useParams();
  const requestId = id ? parseInt(id, 10) : 0;
  const queryClient = useQueryClient();
  
  const { data: request, isLoading } = useGetServiceRequest(requestId, { query: { queryKey: getGetServiceRequestQueryKey(requestId), enabled: !!requestId } });
  const { mutate: updateRequest, isPending: isUpdating } = useUpdateServiceRequest();

  const form = useForm({
    defaultValues: {
      status: "pending",
      technicianNotes: ""
    }
  });

  useEffect(() => {
    if (request) {
      form.reset({
        status: request.status,
        technicianNotes: request.technicianNotes || ""
      });
    }
  }, [request, form]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!request) return <div>Job not found</div>;

  const handleUpdate = (values: any) => {
    updateRequest(
      { id: requestId, data: values },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getGetServiceRequestQueryKey(requestId), updatedData);
          toast.success("Job updated successfully");
        },
        onError: () => toast.error("Failed to update job")
      }
    );
  };

  const markComplete = () => {
    form.setValue("status", "completed");
    handleUpdate(form.getValues());
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/technician">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{request.title}</h1>
            <p className="text-slate-500">Job #{request.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-slate-500">Customer</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{request.customerName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Address</span>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{request.address}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Service Type</span>
                  <div className="mt-1"><ServiceTypeBadge type={request.serviceType} /></div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Scheduled</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{request.scheduledAt ? new Date(request.scheduledAt).toLocaleDateString() : 'ASAP'}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-500 mb-2 block">Description</span>
                <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-teal-100">
            <CardHeader className="bg-teal-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Job Execution
              </CardTitle>
              <CardDescription>Update status and add your service notes here.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="technicianNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Notes (Internal & Customer)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detail the work done, parts replaced, and recommendations..." 
                            className="min-h-[150px] resize-y" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="submit" disabled={isUpdating} variant="outline">
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                    {request.status !== "completed" && (
                      <Button 
                        type="button" 
                        onClick={markComplete}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="w-4 h-4 mr-2" /> Navigate to site
              </Button>
              {/* Other action placeholders */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
