import { useListServiceRequests, getListServiceRequestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Filter } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function AdminRequests() {
  const [statusFilter, setStatusFilter] = useState<any>(undefined);
  
  const { data: requests, isLoading } = useListServiceRequests(
    statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined, 
    { query: { queryKey: getListServiceRequestsQueryKey(statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined) } }
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Service Requests</h1>
        <p className="text-slate-500">Manage and assign all incoming and active requests.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search requests..." className="pl-9" />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter || 'all'} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {(requests || []).length === 0 ? (
             <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-lg border-dashed">
                No requests found matching criteria.
             </div>
          ) : (
            (requests || []).map((req) => (
              <Link key={req.id} href={`/admin/requests/${req.id}`}>
                <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">#{req.id}</span>
                        <h3 className="font-semibold text-slate-900">{req.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{req.address}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden md:block w-[150px] text-sm text-slate-600">
                        {req.customerName}
                      </div>
                      <div className="hidden md:block w-[150px] text-sm text-slate-600">
                        {req.technicianName || <span className="text-slate-400 italic">Unassigned</span>}
                      </div>
                      <div className="flex items-center gap-2 w-[220px] justify-end">
                        <PriorityBadge priority={req.priority} />
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
