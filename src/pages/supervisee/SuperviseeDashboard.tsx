import { useEffect, useState } from "react";
import {
  Calendar,
  ClipboardList,
  Award,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  PortalShell,
  BentoGrid,
  BentoTile,
} from "@/components/portal/BentoShell";
import MoreFeaturesGrid from "@/components/portal/MoreFeaturesGrid";

const SuperviseeDashboard = () => {
  const { user } = useAuth();
  const [nextSupervision, setNextSupervision] = useState<string>("—");
  const [caseLogCount, setCaseLogCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessions")
      .select("session_date, title")
      .eq("client_id", user.id)
      .gte("session_date", new Date().toISOString())
      .order("session_date", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.session_date) {
          setNextSupervision(
            new Date(data.session_date).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
          );
        }
      });
    supabase
      .from("clinical_entries")
      .select("id", { count: "exact", head: true })
      .eq("filled_by", user.id)
      .then(({ count }) => setCaseLogCount(count ?? 0));
  }, [user]);

  return (
    <PortalShell
      title="Supervisee portal"
      subtitle="Track your supervision hours, case logs and competencies."
    >
      <BentoGrid>
        <BentoTile
          feature="sup.next-supervision"
          to="/supervisee/calendar"
          size="lg"
          icon={Calendar}
          label="Next supervision"
          value={nextSupervision}
          accent="navy"
        />
        <BentoTile
          feature="sup.caselog"
          to="/supervisee/case-logs"
          size="md"
          icon={ClipboardList}
          label="Case logs"
          value={caseLogCount}
          hint="Entries recorded"
          accent="orange"
        />
        <BentoTile
          feature="sup.competencies"
          to="/supervisee/competencies"
          size="md"
          icon={Award}
          label="Competencies"
          hint="Progress tracker"
        />
        <BentoTile
          feature="sup.documents"
          to="/supervisee/documents"
          size="md"
          icon={FolderOpen}
          label="Documents"
          hint="Shared by supervisor"
        />
      </BentoGrid>
      <MoreFeaturesGrid
        category="supervisee"
        exclude={["sup.next-supervision","sup.caselog","sup.competencies","sup.documents"]}
      />
    </PortalShell>
  );
};

export default SuperviseeDashboard;
