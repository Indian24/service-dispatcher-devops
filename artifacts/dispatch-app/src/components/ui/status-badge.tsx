import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    assigned: { label: "Assigned", className: "bg-blue-100 text-blue-800 border-blue-200" },
    in_progress: { label: "In Progress", className: "bg-orange-100 text-orange-800 border-orange-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };

  const config = statusMap[status] || { label: status, className: "bg-slate-100 text-slate-800 border-slate-200" };

  return <Badge variant="outline" className={`font-medium ${config.className}`}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const priorityMap: Record<string, { label: string; className: string }> = {
    low: { label: "Low", className: "bg-slate-100 text-slate-700 border-slate-200" },
    medium: { label: "Medium", className: "bg-blue-100 text-blue-700 border-blue-200" },
    high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
    urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
  };

  const config = priorityMap[priority] || { label: priority, className: "bg-slate-100 text-slate-700 border-slate-200" };

  return <Badge variant="outline" className={`font-medium ${config.className}`}>{config.label}</Badge>;
}

export function ServiceTypeBadge({ type }: { type: string }) {
  const label = type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">{label}</Badge>;
}
