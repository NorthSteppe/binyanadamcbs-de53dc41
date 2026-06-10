import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, Settings, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  is_active: boolean;
  display_order: number;
  price_cents: number;
  therapist_rate_cents: number;
  show_duration: boolean;
  show_price: boolean;
  __dirty?: boolean;
}

const ServiceOptionsManager = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    // Admin RPC returns rows including the protected therapist_rate_cents column.
    const { data } = await (supabase as any).rpc("admin_list_service_options");
    if (data) setServices(data as unknown as ServiceOption[]);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const addService = async () => {
    const { error } = await supabase.from("service_options").insert({ name: "New Service", description: "", duration_minutes: 60, display_order: services.length } as any);
    if (!error) { fetchServices(); toast({ title: "Service added" }); }
  };

  const updateService = async (svc: ServiceOption) => {
    // Update non-sensitive columns via the table…
    const { error } = await supabase.from("service_options").update({
      name: svc.name, description: svc.description, duration_minutes: svc.duration_minutes,
      is_active: svc.is_active, display_order: svc.display_order, price_cents: svc.price_cents,
      show_duration: svc.show_duration, show_price: svc.show_price,
    } as any).eq("id", svc.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    // …and the protected therapist payout column via the admin-only RPC.
    const { error: rateErr } = await (supabase as any).rpc("admin_set_service_option_rate", {
      _id: svc.id,
      _rate_cents: svc.therapist_rate_cents || 0,
    });
    if (rateErr) { toast({ title: "Error", description: rateErr.message, variant: "destructive" }); return; }
    toast({ title: "Updated" });
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, __dirty: false } : s));
  };

  const deleteService = async (id: string) => {
    await supabase.from("service_options").delete().eq("id", id);
    fetchServices();
    toast({ title: "Deleted" });
  };

  const update = (id: string, field: string, value: any) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value, __dirty: true } : s));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl mb-2 flex items-center gap-3"><Settings size={28} className="text-primary" /> Service Options</h1>
            <p className="text-muted-foreground mb-8">
              Manage booking options and pricing. Paid bookings raise a draft invoice in Xero automatically — review and send it from Xero.
            </p>
          </motion.div>

          <Button onClick={addService} className="rounded-full gap-2 mb-6"><Plus size={16} /> Add Service</Button>

          {loading ? <p className="text-muted-foreground">Loading...</p> : (
            <div className="space-y-4">
              {services.map((svc) => (
                <div key={svc.id} className="bg-card rounded-xl border border-border/50 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input value={svc.name} onChange={(e) => update(svc.id, "name", e.target.value)} className="font-semibold" />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Active</Label>
                      <Switch checked={svc.is_active} onCheckedChange={(v) => update(svc.id, "is_active", v)} />
                    </div>
                  </div>
                  <Textarea value={svc.description} onChange={(e) => update(svc.id, "description", e.target.value)} placeholder="Description" className="text-sm" />
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (min)</Label>
                      <Input
                        key={`dur-${svc.id}`}
                        type="number"
                        defaultValue={svc.duration_minutes}
                        onBlur={(e) => update(svc.id, "duration_minutes", parseInt(e.target.value) || 60)}
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Order</Label>
                      <Input type="number" value={svc.display_order} onChange={(e) => update(svc.id, "display_order", parseInt(e.target.value) || 0)} className="w-20" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Client price (£)</Label>
                      <Input
                        key={`price-${svc.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={(svc.price_cents / 100).toFixed(2)}
                        onBlur={(e) => update(svc.id, "price_cents", Math.round(parseFloat(e.target.value || "0") * 100))}
                        className="w-28"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Therapist payout (£)</Label>
                      <Input
                        key={`payout-${svc.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={((svc.therapist_rate_cents || 0) / 100).toFixed(2)}
                        onBlur={(e) => update(svc.id, "therapist_rate_cents", Math.round(parseFloat(e.target.value || "0") * 100))}
                        className="w-28"
                      />
                      <div className="text-[10px] text-muted-foreground">Admin-only · never shown to clients</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-2 border-t border-border/40">
                    <span className="text-xs font-medium text-muted-foreground">Show to clients on booking:</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={svc.show_duration} onCheckedChange={(v) => update(svc.id, "show_duration", v)} />
                      <Label className="text-xs">Duration / time</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={svc.show_price} onCheckedChange={(v) => update(svc.id, "show_price", v)} />
                      <Label className="text-xs">Price</Label>
                    </div>

                    <div className="ms-auto flex gap-2 flex-wrap">
                      {svc.__dirty ? (
                        <Button size="sm" className="rounded-full gap-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => updateService(svc)}><Save size={14} /> Save</Button>
                      ) : (
                        <Button size="sm" className="rounded-full gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => update(svc.id, "__dirty", true)}><Pencil size={14} /> Edit</Button>
                      )}
                      <Button size="sm" variant="destructive" className="rounded-full gap-1" onClick={() => deleteService(svc.id)}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ServiceOptionsManager;
