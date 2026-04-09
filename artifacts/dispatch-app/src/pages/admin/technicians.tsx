import { useListTechnicians, getListTechniciansQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, UserCheck, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminTechnicians() {
  const { data: technicians, isLoading } = useListTechnicians({ query: { queryKey: getListTechniciansQueryKey() } });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Technicians</h1>
          <p className="text-slate-500">Manage field staff and view workloads.</p>
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search technicians..." className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(technicians || []).map((tech) => (
            <Card key={tech.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{tech.name}</h3>
                    <p className="text-sm text-slate-500">{tech.email}</p>
                    <p className="text-sm text-slate-500">{tech.phone || 'No phone'}</p>
                  </div>
                  {tech.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Inactive</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1 mb-1">
                      <Briefcase className="w-3 h-3" /> Active Jobs
                    </span>
                    <span className="text-2xl font-bold text-teal-700">{tech.activeJobs}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1 mb-1">
                      <UserCheck className="w-3 h-3" /> Total Completed
                    </span>
                    <span className="text-2xl font-bold text-slate-900">{tech.totalJobs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
