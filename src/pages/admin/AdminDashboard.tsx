import {
  Calendar,
  Users,
  UserCog,
  TrendingUp,
  FileText,
  ToggleRight,
} from "lucide-react";
import {
  PortalShell,
  BentoGrid,
  BentoTile,
} from "@/components/portal/BentoShell";
import MoreFeaturesGrid from "@/components/portal/MoreFeaturesGrid";

const AdminDashboard = () => {
  return (
    <PortalShell
      title="Practice control"
      subtitle="Run the business — calendar, clients, team, finance and what each role sees."
    >
      <BentoGrid>
        <BentoTile
          feature="admin.calendar"
          to="/admin/calendar"
          size="lg"
          icon={Calendar}
          label="Practice calendar"
          hint="All sessions across the team"
          accent="navy"
        />
        <BentoTile
          feature="admin.clients"
          to="/admin/clients"
          size="md"
          icon={Users}
          label="Clients"
          hint="Records, intakes, pathways"
          accent="orange"
        />
        <BentoTile
          feature="admin.team"
          to="/admin/users"
          size="md"
          icon={UserCog}
          label="Team"
          hint="Members and access"
        />
        <BentoTile
          feature="admin.finance"
          to="/admin/business"
          size="md"
          icon={TrendingUp}
          label="Finance"
          hint="Revenue & payouts"
        />
        <BentoTile
          feature="admin.content"
          to="/admin/site-content"
          size="md"
          icon={FileText}
          label="Site content"
          hint="Pages, blog, hero"
        />
        <BentoTile
          feature="admin.features"
          to="/admin/features"
          size="md"
          icon={ToggleRight}
          label="Feature toggles"
          hint="Control what each role sees"
          accent="orange"
        />
      </BentoGrid>
      <MoreFeaturesGrid
        category="admin"
        exclude={["admin.calendar","admin.clients","admin.team","admin.finance","admin.content","admin.features"]}
      />
    </PortalShell>
  );
};

export default AdminDashboard;
