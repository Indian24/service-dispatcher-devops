import { useGetServiceRequest, getGetServiceRequestQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Clock, MapPin, Wrench, FileText } from "lucide-react";
import { StatusBadge, PriorityBadge, ServiceTypeBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function CustomerRequestDetail() {
  const { id } = useParams();
  const requestId = id ? parseInt(id, 10) : 0;
  const { data: request, isLoading } = useGetServiceRequest(requestId, { query: { queryKey: getGetServiceRequestQueryKey(requestId), enabled: !!requestId } });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!request) {
    return <div>Request not found</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customer">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">Service Type</span>
                <div><ServiceTypeBadge type={request.serviceType} /></div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</span>
                <p className="text-sm text-slate-900">{request.address}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled For</span>
                <p className="text-sm text-slate-900">{request.scheduledAt ? new Date(request.scheduledAt).toLocaleDateString() : 'Pending'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Wrench className="w-3 h-3" /> Assigned Technician</span>
                <p className="text-sm text-slate-900">{request.technicianName || 'Pending Assignment'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
