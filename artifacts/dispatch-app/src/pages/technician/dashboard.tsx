import { useListServiceRequests, getListServiceRequestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";

export default function TechnicianDashboard() {
  const { data: requests, isLoading } = useListServiceRequests(undefined, { query: { queryKey: getListServiceRequestsQueryKey() } });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const jobs = requests || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Jobs</h1>
        <p className="text-slate-500">View and manage your assigned service jobs.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.length === 0 ? (
          <Card className="shadow-sm bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p>No jobs assigned currently.</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Link key={job.id} href={`/technician/jobs/${job.id}`}>
              <Card className="shadow-sm hover:border-teal-500 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{job.title}</h3>
                      <StatusBadge status={job.status} />
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="text-sm text-slate-500">{job.address}</p>
                    <p className="text-sm text-slate-600">Customer: {job.customerName}</p>
                  </div>
                  <div className="text-sm text-slate-500 text-right">
                    {job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString() : 'Unscheduled'}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
