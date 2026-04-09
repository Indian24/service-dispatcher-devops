import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/layout";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";

// Dashboards
import AdminDashboard from "@/pages/admin/dashboard";
import AdminRequests from "@/pages/admin/requests";
import AdminRequestDetail from "@/pages/admin/request-detail";
import AdminTechnicians from "@/pages/admin/technicians";
import AdminCustomers from "@/pages/admin/customers";

import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerNewRequest from "@/pages/customer/new-request";
import CustomerRequestDetail from "@/pages/customer/request-detail";

import TechnicianDashboard from "@/pages/technician/dashboard";
import TechnicianJobDetail from "@/pages/technician/job-detail";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;

  switch (user.role) {
    case "admin": return <Redirect to="/admin" />;
    case "technician": return <Redirect to="/technician" />;
    case "customer": return <Redirect to="/customer" />;
    default: return <Redirect to="/login" />;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/" component={RootRedirect} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/requests">
        {() => <ProtectedRoute component={AdminRequests} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/requests/:id">
        {() => <ProtectedRoute component={AdminRequestDetail} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/technicians">
        {() => <ProtectedRoute component={AdminTechnicians} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/customers">
        {() => <ProtectedRoute component={AdminCustomers} allowedRoles={["admin"]} />}
      </Route>
      
      {/* Technician Routes */}
      <Route path="/technician">
        {() => <ProtectedRoute component={TechnicianDashboard} allowedRoles={["technician"]} />}
      </Route>
      <Route path="/technician/jobs/:id">
        {() => <ProtectedRoute component={TechnicianJobDetail} allowedRoles={["technician"]} />}
      </Route>
      
      {/* Customer Routes */}
      <Route path="/customer">
        {() => <ProtectedRoute component={CustomerDashboard} allowedRoles={["customer"]} />}
      </Route>
      <Route path="/customer/new-request">
        {() => <ProtectedRoute component={CustomerNewRequest} allowedRoles={["customer"]} />}
      </Route>
      <Route path="/customer/requests/:id">
        {() => <ProtectedRoute component={CustomerRequestDetail} allowedRoles={["customer"]} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
