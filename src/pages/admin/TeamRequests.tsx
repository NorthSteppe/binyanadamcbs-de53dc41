import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface TeamRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  full_name: string;
  requested_role: "team_member" | "supervisee";
}

const TeamRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("team_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      const nameMap = Object.fromEntries((profiles || []).map((p) => [p.id, p.full_name]));
      setRequests(data.map((r) => ({ ...r, full_name: nameMap[r.user_id] || "Unknown" })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: TeamRequest) => {
    // Add admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: request.user_id, role: "admin" });

    if (roleError) {
      toast.error("Failed to grant admin role");
      return;
    }

    // Update request status
    await supabase
      .from("team_requests")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
      .eq("id", request.id);

    toast.success(`${request.full_name} approved as therapist`);
    fetchRequests();
  };

  const handleReject = async (request: TeamRequest) => {
    await supabase
      .from("team_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
      .eq("id", request.id);

    toast.success(`Request from ${request.full_name} rejected`);
    fetchRequests();
  };

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-primary" size={28} />
              Team Access Requests
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Approve or reject therapist sign-up requests</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <>
              {/* Pending */}
              <div className="mb-10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  Pending ({pending.length})
                </h2>
                {pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground bg-card border border-border/50 rounded-2xl p-6">No pending requests.</p>
                ) : (
                  <div className="space-y-3">
                    {pending.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between bg-card border border-border/50 rounded-2xl p-5"
                      >
                        <div>
                          <p className="font-semibold text-card-foreground">{r.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested {format(new Date(r.created_at), "MMM d, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="rounded-full gap-1"
                            onClick={() => handleApprove(r)}
                          >
                            <Check size={14} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleReject(r)}
                          >
                            <X size={14} /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviewed */}
              {reviewed.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">History</h2>
                  <div className="space-y-2">
                    {reviewed.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between bg-card border border-border/50 rounded-xl p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{r.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(r.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge variant={r.status === "approved" ? "default" : "destructive"} className="capitalize">
                          {r.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TeamRequests;
