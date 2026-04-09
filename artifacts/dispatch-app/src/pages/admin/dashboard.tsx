import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetStatusBreakdown, getGetStatusBreakdownQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Wrench, Ticket, AlertCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: breakdown, isLoading: loadingBreakdown } = useGetStatusBreakdown({ query: { queryKey: getGetStatusBreakdownQueryKey() } });
  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  if (loadingSummary || loadingBreakdown || loadingActivity) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const chartData = breakdown ? [
    { name: 'Pending', value: breakdown.pending, color: '#eab308' },
    { name: 'Assigned', value: breakdown.assigned, color: '#3b82f6' },
    { name: 'In Progress', value: breakdown.in_progress, color: '#f97316' },
    { name: 'Completed', value: breakdown.completed, color: '#22c55e' },
    { name: 'Cancelled', value: breakdown.cancelled, color: '#94a3b8' },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500">Overview of field operations and service requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
            <Ticket className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary?.totalRequests || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Technicians</CardTitle>
            <Wrench className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary?.activeTechnicians || 0} <span className="text-sm font-normal text-slate-400">/ {summary?.totalTechnicians || 0}</span></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending / In Progress</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{(summary?.pendingRequests || 0) + (summary?.inProgressRequests || 0)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary?.totalCustomers || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Request Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-slate-400">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recentActivity || []).length === 0 ? (
                <div className="text-center py-6 text-slate-500">No recent activity.</div>
              ) : (
                (recentActivity || []).slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-md transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Link href={`/admin/requests/${req.id}`} className="font-medium text-slate-900 hover:text-teal-700 hover:underline">
                          {req.title}
                        </Link>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="flex text-sm text-slate-500 gap-4">
                        <span>Customer: {req.customerName}</span>
                        {req.technicianName && <span>Tech: {req.technicianName}</span>}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(req.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
