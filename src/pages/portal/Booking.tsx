import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle2, CreditCard, XCircle, Video, MapPin, Link2, Repeat, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { generateMeetingLink, type MeetingPlatform } from "@/utils/meetingLinks";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  show_duration: boolean;
  show_price: boolean;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

type BookingMode = "single" | "recurring" | "block";
type RecurrencePattern = "weekly" | "biweekly" | "monthly";



const Booking = () => {
  const { user, isStaff, isAdmin } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const portalT = (t as any).portalBooking || {};
  const [searchParams] = useSearchParams();

  // Staff/admin: book on behalf of a client
  type ClientPick = { id: string; full_name: string; kind: "user" | "manual"; manual_id?: string };
  const [bookableClients, setBookableClients] = useState<ClientPick[]>([]);
  const [bookFor, setBookFor] = useState<string>(""); // "user:<id>" or "manual:<id>" or "" for self


  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [blockDates, setBlockDates] = useState<Date[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [hourRules, setHourRules] = useState<any[]>([]);
  const [platform, setPlatform] = useState<MeetingPlatform>("in_person");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  // Multi-session state
  const [bookingMode, setBookingMode] = useState<BookingMode>("single");
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>("weekly");
  const [recurrenceCount, setRecurrenceCount] = useState(4);

  useEffect(() => {
    if (searchParams.get("success") === "true") setSuccess(true);
    if (searchParams.get("canceled") === "true") setCanceled(true);
  }, [searchParams]);

  useEffect(() => {
    supabase.from("service_options")
      .select("id, name, description, duration_minutes, price_cents, stripe_price_id, is_active, display_order, show_duration, show_price")
      .eq("is_active", true).order("display_order")
      .then(({ data }) => { if (data) setServices(data as unknown as ServiceOption[]); });
    supabase.from("calendar_hour_rules" as any).select("*")
      .then(({ data }) => { if (data) setHourRules(data as any[]); });
  }, []);

  // Load bookable clients for staff/admin (assigned clients + manual clients; admins see all)
  useEffect(() => {
    if (!user || !isStaff) return;
    (async () => {
      const list: ClientPick[] = [];

      // Profiles: admins see all; therapists see assigned clients
      if (isAdmin) {
        const { data } = await supabase.rpc("get_safe_profiles");
        if (data) {
          for (const p of data as Array<{ id: string; full_name: string | null }>) {
            list.push({ id: p.id, full_name: p.full_name || "Unnamed", kind: "user" });
          }
        }
      } else {
        const { data: assigns } = await supabase
          .from("client_assignments")
          .select("client_id")
          .eq("assignee_id", user.id);
        const ids = (assigns || []).map((a) => a.client_id);
        if (ids.length) {
          const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
          for (const p of (data || []) as Array<{ id: string; full_name: string | null }>) {
            list.push({ id: p.id, full_name: p.full_name || "Unnamed", kind: "user" });
          }
        }
      }

      // Manual clients (admins see all; therapists see those without a linked user via own assignments)
      const { data: mc } = await supabase.from("manual_clients").select("id, full_name, linked_user_id");
      if (mc) {
        for (const m of mc as Array<{ id: string; full_name: string; linked_user_id: string | null }>) {
          if (m.linked_user_id) continue; // skip those already linked to a user (covered above)
          list.push({ id: m.id, full_name: m.full_name + " (manual)", kind: "manual", manual_id: m.id });
        }
      }

      list.sort((a, b) => a.full_name.localeCompare(b.full_name));
      setBookableClients(list);
    })();
  }, [user, isStaff, isAdmin]);


  // Compute the list of session datetimes based on current selections
  const computeSessionDates = (): Date[] => {
    if (!selectedTime) return [];
    const [h, m] = selectedTime.split(":").map((v) => parseInt(v));

    if (bookingMode === "block") {
      return [...blockDates]
        .sort((a, b) => a.getTime() - b.getTime())
        .map((d) => {
          const x = new Date(d);
          x.setHours(h, m, 0, 0);
          return x;
        });
    }

    if (!selectedDate) return [];
    const base = new Date(selectedDate);
    base.setHours(h, m, 0, 0);

    if (bookingMode === "single") return [base];

    const count = Math.max(2, Math.min(12, recurrenceCount || 2));
    const out: Date[] = [];
    for (let i = 0; i < count; i++) {
      const next = new Date(base);
      if (recurrencePattern === "weekly") next.setDate(base.getDate() + 7 * i);
      else if (recurrencePattern === "biweekly") next.setDate(base.getDate() + 14 * i);
      else if (recurrencePattern === "monthly") next.setMonth(base.getMonth() + i);
      out.push(next);
    }
    return out;
  };

  const sessionDates = computeSessionDates();
  const sessionCount = sessionDates.length;
  const totalPriceCents = (selectedService?.price_cents || 0) * sessionCount;

  const handleBook = async () => {
    if (!user || !selectedService || sessionCount === 0) return;

    // Determine target client (self for clients; selected client for staff/admin)
    let targetClientId: string = user.id;
    let targetManualClientId: string | null = null;
    let targetClientEmail: string | undefined = user.email ?? undefined;
    if (isStaff) {
      if (!bookFor) {
        toast({ title: "Select a client", description: "Pick the client to book for.", variant: "destructive" });
        return;
      }
      const pick = bookableClients.find((c) => (c.kind === "user" ? `user:${c.id}` : `manual:${c.id}`) === bookFor);
      if (!pick) return;
      if (pick.kind === "user") {
        targetClientId = pick.id;
        targetManualClientId = null;
        targetClientEmail = undefined; // not required for meeting link
      } else {
        // Manual client: client_id NOT NULL on sessions, so use staff's own id as placeholder and set manual_client_id
        targetClientId = user.id;
        targetManualClientId = pick.manual_id ?? pick.id;
      }
    }

    setLoading(true);

    // Resolve a meeting URL once and reuse for all sessions in the block.
    let meetingUrl: string | null = generateMeetingLink(platform);
    if (platform !== "in_person") {
      const providerKey = platform === "google_meet" ? "google" : platform;
      try {
        // Therapist as host when staff is booking; otherwise look up an assignee
        let hostId: string | undefined = isStaff ? user.id : undefined;
        if (!hostId) {
          const { data: assignment } = await supabase
            .from("client_assignments")
            .select("assignee_id")
            .eq("client_id", targetClientId)
            .limit(1)
            .maybeSingle();
          hostId = assignment?.assignee_id;
        }

        if (hostId) {
          const { data: meet, error: meetErr } = await supabase.functions.invoke("create-meeting", {
            body: {
              host_user_id: hostId,
              provider: providerKey,
              title: selectedService.name,
              start_iso: sessionDates[0].toISOString(),
              duration_minutes: selectedService.duration_minutes,
              attendee_email: targetClientEmail,
            },
          });
          if (!meetErr && meet?.join_url) meetingUrl = meet.join_url;
        }
      } catch (e) {
        console.warn("Auto meeting creation failed, falling back to instant link", e);
      }
    }

    const isPaid = selectedService.price_cents > 0;

    const baseRow: Record<string, unknown> = {
      client_id: targetClientId,
      title: selectedService.name,
      description: description || null,
      duration_minutes: selectedService.duration_minutes,
      meeting_platform: platform === "in_person" ? null : platform,
      meeting_url: meetingUrl,
      service_option_id: selectedService.id,
      price_cents: selectedService.price_cents,
    };
    if (targetManualClientId) baseRow.manual_client_id = targetManualClientId;
    if (isStaff) baseRow.therapist_id = user.id;


    const { data: firstInserted, error: firstErr } = await supabase
      .from("sessions")
      .insert({ ...(baseRow as any), session_date: sessionDates[0].toISOString() })
      .select("id")
      .single();

    if (firstErr || !firstInserted) {
      setLoading(false);
      toast({ title: "Booking failed", description: firstErr?.message, variant: "destructive" });
      return;
    }

    const allIds: string[] = [firstInserted.id];

    if (sessionDates.length > 1) {
      const extra = sessionDates.slice(1).map((d) => ({
        ...(baseRow as any),
        session_date: d.toISOString(),
        recurrence_parent_id: firstInserted.id,
      }));
      const { data: extraInserted, error: extraErr } = await supabase.from("sessions").insert(extra as any).select("id");
      if (extraErr) {
        toast({ title: "Some sessions failed", description: extraErr.message, variant: "destructive" });
      } else if (extraInserted) {
        for (const r of extraInserted) allIds.push(r.id);
      }
    }

    // Fire-and-forget Xero invoice for paid services
    if (isPaid) {
      supabase.functions.invoke("xero-invoice-booking", { body: { session_ids: allIds } })
        .catch((e) => console.warn("Xero invoice failed", e));
    }

    setLoading(false);
    setSuccess(true);
    toast({
      title: sessionCount > 1
        ? `${sessionCount} sessions booked`
        : (portalT.bookingSuccess || "Session booked!"),
      description: isPaid ? "An invoice will be emailed to you shortly." : undefined,
    });
  };

  const resetForm = () => {
    setSuccess(false);
    setCanceled(false);
    setSelectedService(null);
    setSelectedDate(undefined);
    setBlockDates([]);
    setSelectedTime("");
    setPlatform("in_person");
    setDescription("");
    setBookingMode("single");
    setRecurrencePattern("weekly");
    setRecurrenceCount(4);
    window.history.replaceState({}, "", "/portal/booking");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-20">
          <div className="container text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
              <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
              <h1 className="text-3xl mb-3">{portalT.bookingConfirmed}</h1>
              <p className="text-muted-foreground mb-6">{portalT.bookingConfirmedText}</p>
              <Button onClick={resetForm} variant="outline" className="rounded-full">
                {portalT.bookAnother}
              </Button>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-20">
          <div className="container text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
              <XCircle className="mx-auto text-destructive mb-4" size={48} />
              <h1 className="text-3xl mb-3">{portalT.paymentCancelled}</h1>
              <p className="text-muted-foreground mb-6">{portalT.paymentCancelledText}</p>
              <Button onClick={resetForm} variant="outline" className="rounded-full">
                {portalT.tryAgain}
              </Button>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const modeOptions: { id: BookingMode; label: string; Icon: typeof CalendarIcon; hint: string }[] = [
    { id: "single", label: "Single session", Icon: CalendarIcon, hint: "Just one appointment" },
    { id: "recurring", label: "Recurring", Icon: Repeat, hint: "Repeat at a regular pattern" },
    { id: "block", label: "Block of sessions", Icon: Layers, hint: "Pick multiple custom dates" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-3">
              <CalendarIcon className="text-primary" size={28} />
              {portalT.bookASession}
            </h1>
            <p className="text-muted-foreground mb-8">{portalT.bookSubtitle}</p>
          </motion.div>

          {/* Staff/admin: pick which client to book for */}
          {isStaff && (
            <div className="mb-8 bg-card border-2 border-primary/20 rounded-xl p-5">
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                Book on behalf of
              </Label>
              <Select value={bookFor} onValueChange={setBookFor}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={bookableClients.length ? "Select a client…" : "No bookable clients found"} />
                </SelectTrigger>
                <SelectContent>
                  {bookableClients.map((c) => {
                    const key = c.kind === "user" ? `user:${c.id}` : `manual:${c.id}`;
                    return <SelectItem key={key} value={key}>{c.full_name}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                A draft Xero invoice will be raised automatically for paid services.
              </p>
            </div>
          )}


          {/* Step 1: Service selection */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">{portalT.step1}</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={cn(
                    "text-start p-5 rounded-xl border-2 transition-all",
                    selectedService?.id === svc.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-foreground">{svc.name}</p>
                    {svc.show_price !== false && svc.price_cents > 0 && (
                      <span className="text-sm font-bold text-primary">
                        £{(svc.price_cents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{svc.description}</p>
                  {svc.show_duration !== false && (
                    <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                      <Clock size={12} /> {svc.duration_minutes} {portalT.minutes}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 1b: Booking type */}
          {selectedService && (
            <div className="mb-8">
              <Label className="text-base font-semibold mb-3 block">How many sessions?</Label>
              <div className="grid sm:grid-cols-3 gap-3">
                {modeOptions.map(({ id, label, Icon, hint }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setBookingMode(id);
                      // Clear conflicting selections
                      if (id === "block") setSelectedDate(undefined);
                      else setBlockDates([]);
                    }}
                    className={cn(
                      "text-start p-4 rounded-xl border-2 transition-all flex gap-3 items-start",
                      bookingMode === id
                        ? "border-primary bg-primary/5"
                        : "border-border/50 bg-card hover:border-primary/30"
                    )}
                  >
                    <Icon size={18} className={bookingMode === id ? "text-primary mt-0.5" : "text-muted-foreground mt-0.5"} />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                    </div>
                  </button>
                ))}
              </div>

              {bookingMode === "recurring" && (
                <div className="grid sm:grid-cols-2 gap-3 mt-4 bg-card border border-border/50 rounded-xl p-4">
                  <div>
                    <Label className="text-xs mb-1.5 block text-muted-foreground">Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={(v) => setRecurrencePattern(v as RecurrencePattern)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Every week</SelectItem>
                        <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                        <SelectItem value="monthly">Every month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block text-muted-foreground">Number of sessions</Label>
                    <Input
                      type="number" min={2} max={12}
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(Math.max(2, Math.min(12, parseInt(e.target.value) || 2)))}
                      className="h-9"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedService && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  {bookingMode === "block" ? "Pick your dates" : portalT.step2}
                </Label>
                <div className="bg-card rounded-xl border border-border/50 p-4 flex justify-center">
                  {bookingMode === "block" ? (
                    <Calendar
                      mode="multiple"
                      selected={blockDates}
                      onSelect={(d) => setBlockDates(d || [])}
                      disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                      className="pointer-events-auto"
                    />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                      className="pointer-events-auto"
                    />
                  )}
                </div>
                {bookingMode === "block" && blockDates.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {blockDates.length} date{blockDates.length === 1 ? "" : "s"} selected
                  </p>
                )}
              </div>
              <div>
                <Label className="text-base font-semibold mb-3 block">{portalT.step3}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const [hh, mm] = slot.split(":").map(Number);
                    const slotMin = hh * 60 + mm;
                    const slotEnd = slotMin + (selectedService?.duration_minutes || 60);
                    const checkDate = selectedDate || (blockDates[0]);
                    const dow = checkDate ? checkDate.getDay() : -1;
                    const dateKey = checkDate ? `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,"0")}-${String(checkDate.getDate()).padStart(2,"0")}` : "";
                    const applicable = (hourRules || []).filter((r: any) =>
                      (r.specific_date && r.specific_date === dateKey) || (!r.specific_date && r.day_of_week === dow)
                    );
                    const blockingRule = applicable.find((r: any) => !r.allow_booking && r.end_minutes > slotMin && r.start_minutes < slotEnd);
                    const infoRule = applicable.find((r: any) => r.end_minutes > slotMin && r.start_minutes < slotEnd && r.info);
                    return (
                      <button
                        key={slot}
                        onClick={() => !blockingRule && setSelectedTime(slot)}
                        disabled={!!blockingRule}
                        title={blockingRule ? (blockingRule.info || `${blockingRule.label} — not bookable`) : (infoRule ? infoRule.info : undefined)}
                        className={cn(
                          "py-2.5 px-3 rounded-lg text-sm font-medium border transition-all",
                          blockingRule
                            ? "border-border/30 bg-muted/30 text-muted-foreground line-through cursor-not-allowed"
                            : selectedTime === slot
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/50 bg-card text-foreground hover:border-primary/30"
                        )}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {bookingMode === "block" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    The same time will be used for all selected dates.
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedService && sessionCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
              <Label className="text-base font-semibold mb-3 block">{portalT.stepPlatform || "4. Meeting Format"}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {([
                  { id: "in_person", label: portalT.platformInPerson || "In-person", Icon: MapPin },
                  { id: "zoom", label: portalT.platformZoom || "Zoom", Icon: Video },
                  { id: "teams", label: portalT.platformTeams || "Teams", Icon: Video },
                  { id: "google_meet", label: portalT.platformMeet || "Meet", Icon: Video },
                ] as const).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPlatform(id)}
                    className={cn(
                      "py-3 px-2 rounded-xl border-2 text-xs font-medium flex flex-col items-center gap-1.5 transition-all",
                      platform === id
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/50 bg-card text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <Icon size={18} className={platform === id ? "text-primary" : ""} />
                    {label}
                  </button>
                ))}
              </div>
              {platform !== "in_person" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                  <Link2 size={11} /> {portalT.platformHint || "A join link will be generated automatically."}
                </p>
              )}
            </motion.div>
          )}

          {selectedService && sessionCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border/50 p-6">
              <Label className="text-base font-semibold mb-3 block">{portalT.step4}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl mb-4"
                placeholder={portalT.notesPlaceholder}
              />
              <div className="bg-muted rounded-xl p-4 mb-4 text-sm">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {selectedService.name}
                      {sessionCount > 1 && <span className="ms-2 text-xs text-primary">× {sessionCount}</span>}
                    </p>
                    <div className="text-muted-foreground text-xs mt-1 space-y-0.5 max-h-32 overflow-auto">
                      {sessionDates.slice(0, 6).map((d, i) => (
                        <p key={i}>
                          {d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {selectedTime}{selectedService.show_duration !== false ? ` · ${selectedService.duration_minutes} min` : ""}
                        </p>
                      ))}
                      {sessionDates.length > 6 && (
                        <p className="italic">+ {sessionDates.length - 6} more…</p>
                      )}
                    </div>
                    {platform !== "in_person" && (
                      <p className="text-primary text-xs mt-2 flex items-center gap-1">
                        <Video size={11} /> {platform === "zoom" ? "Zoom" : platform === "teams" ? "Microsoft Teams" : "Google Meet"}
                      </p>
                    )}
                  </div>
                  {selectedService.show_price !== false && totalPriceCents > 0 && (
                    <div className="text-end shrink-0">
                      <p className="text-lg font-bold text-primary">£{(totalPriceCents / 100).toFixed(2)}</p>
                      {sessionCount > 1 && (
                        <p className="text-[10px] text-muted-foreground">
                          {sessionCount} × £{(selectedService.price_cents / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleBook} className="w-full rounded-full" size="lg" disabled={loading}>
                {totalPriceCents > 0 ? (
                  <>
                    <CreditCard size={18} className="me-2" />
                    {loading
                      ? portalT.redirecting
                      : `Pay £${(totalPriceCents / 100).toFixed(2)} & book ${sessionCount} session${sessionCount === 1 ? "" : "s"}`}
                  </>
                ) : (
                  <>
                    <CalendarIcon size={18} className="me-2" />
                    {loading
                      ? portalT.booking
                      : sessionCount > 1
                        ? `Book ${sessionCount} sessions`
                        : portalT.confirmBooking}
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Booking;
