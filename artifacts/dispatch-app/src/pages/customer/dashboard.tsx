import { useListServiceRequests, getListServiceRequestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomerDashboard() {
  const { data: requests, isLoading } = useListServiceRequests(undefined, { query: { queryKey: getListServiceRequestsQueryKey() } });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const myRequests = requests || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Requests</h1>
          <p className="text-slate-500">Track your service and maintenance requests.</p>
        </div>
        {/* We will add this link properly soon */}
        <Link href="/customer/new-request" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-teal-700 text-primary-foreground shadow hover:bg-teal-800 h-9 px-4 py-2">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myRequests.length === 0 ? (
          <Card className="shadow-sm bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p>You haven't made any requests yet.</p>
            </CardContent>
          </Card>
        ) : (
          myRequests.map((req) => (
            <Card key={req.id} className="shadow-sm">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{req.title}</h3>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-sm text-slate-500">{req.serviceType.replace('_', ' ')}</p>
                </div>
                <div className="text-sm text-slate-500 text-right">
                  {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
