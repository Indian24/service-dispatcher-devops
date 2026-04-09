import { useGetServiceRequest, getGetServiceRequestQueryKey, useListTechnicians, getListTechniciansQueryKey, useAssignTechnician } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Clock, MapPin, User, FileText, Wrench } from "lucide-react";
import { StatusBadge, PriorityBadge, ServiceTypeBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminRequestDetail() {
  const { id } = useParams();
  const requestId = id ? parseInt(id, 10) : 0;
  const queryClient = useQueryClient();
  
  const { data: request, isLoading } = useGetServiceRequest(requestId, { query: { queryKey: getGetServiceRequestQueryKey(requestId), enabled: !!requestId } });
  const { data: technicians } = useListTechnicians({ query: { queryKey: getListTechniciansQueryKey() } });
  const { mutate: assign, isPending: isAssigning } = useAssignTechnician();

  const [selectedTechId, setSelectedTechId] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!request) return <div>Request not found</div>;

  const handleAssign = () => {
    if (!selectedTechId) return;
    assign(
      { id: requestId, data: { technicianId: parseInt(selectedTechId, 10) } },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getGetServiceRequestQueryKey(requestId), updatedData);
          toast.success("Technician assigned successfully");
        },
        onError: () => toast.error("Failed to assign technician")
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/requests">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{request.title}</h1>
            <p className="text-slate-500">Request #{request.id}</p>
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
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900">{request.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{request.address}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-slate-500">Service Type</span>
                  <div className="mt-1"><ServiceTypeBadge type={request.serviceType} /></div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Scheduled</span>
                  <div className="flex items-center gap-2 mt-1 text-slate-900">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{request.scheduledAt ? new Date(request.scheduledAt).toLocaleDateString() : 'Not Scheduled'}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500 mb-2 block">Description</span>
                <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Technician Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.technicianNotes ? (
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                  <p className="text-slate-700 whitespace-pre-wrap">{request.technicianNotes}</p>
                </div>
              ) : (
                <p className="text-slate-500 italic">No notes provided yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="shadow-sm border-teal-100">
            <CardHeader className="bg-teal-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-600" />
                Dispatch
              </CardTitle>
              <CardDescription>Assign or reassign a technician to this job.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Current Assignment</label>
                {request.technicianName ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900">
                    {request.technicianName}
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm">
                    Unassigned
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-700">Assign Technician</label>
                <div className="flex gap-2">
                  <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {(technicians || []).map((tech) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.name} ({tech.activeJobs} active jobs)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAssign} 
                    disabled={!selectedTechId || isAssigning || request.technicianId?.toString() === selectedTechId}
                    className="bg-teal-700 hover:bg-teal-800"
                  >
                    {isAssigning ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
