import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, CheckCircle2, Loader2, MessageCircle } from "lucide-react";

const NotificationSettings = () => {
  const { user } = useAuth();
  const [chatId, setChatId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profile_secrets" as any)
      .select("telegram_chat_id")
      .eq("user_id", user.id)
      .single()
      .then(({ data }: any) => {
        const tid = data?.telegram_chat_id;
        if (tid) {
          setChatId(tid);
          setConnected(true);
        }
      });
  }, [user]);

  const saveChatId = async () => {
    if (!user || !chatId.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profile_secrets" as any)
      .upsert({ user_id: user.id, telegram_chat_id: chatId.trim() });
    setSaving(false);
    if (error) {
      toast.error("Failed to save Telegram Chat ID");
    } else {
      setConnected(true);
      toast.success("Telegram Chat ID saved!");
    }
  };

  const disconnect = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profile_secrets" as any)
      .update({ telegram_chat_id: null })
      .eq("user_id", user.id);
    setChatId("");
    setConnected(false);
    setSaving(false);
    toast.success("Telegram disconnected");
  };

  const testNotification = async () => {
    if (!user) return;
    setTesting(true);
    try {
      const { error } = await supabase.functions.invoke("send-telegram-notification", {
        body: {
          user_id: user.id,
          title: "Test Notification",
          message: "This is a test notification from Blueprint CBS. If you see this, Telegram notifications are working! 🎉",
          link: "/portal",
        },
      });
      if (error) throw error;
      toast.success("Test notification sent! Check your Telegram.");
    } catch {
      toast.error("Failed to send test notification");
    }
    setTesting(false);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle size={18} className="text-blue-500" />
          Telegram Notifications
          {connected && (
            <Badge variant="outline" className="text-green-600 border-green-300 text-[10px] ml-auto">
              <CheckCircle2 size={10} className="mr-1" /> Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Receive instant notifications on Telegram when you get new sessions, messages, tasks, or admin alerts.
        </p>

        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
          <p className="font-medium text-foreground">How to get your Chat ID:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open Telegram and search for <strong>@userinfobot</strong></li>
            <li>Send any message to the bot</li>
            <li>It will reply with your Chat ID number</li>
            <li>Paste that number below</li>
          </ol>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Telegram Chat ID</Label>
          <div className="flex gap-2">
            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 123456789"
              className="font-mono text-sm"
            />
            <Button size="sm" onClick={saveChatId} disabled={saving || !chatId.trim()}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>

        {connected && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={testNotification}
              disabled={testing}
              className="gap-1.5"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Test
            </Button>
            <Button size="sm" variant="ghost" onClick={disconnect} className="text-destructive">
              Disconnect
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
