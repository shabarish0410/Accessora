// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import webpush from "https://esm.sh/web-push@3.6.7";

webpush.setVapidDetails(
  "mailto:admin@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY") || "",
  Deno.env.get("VAPID_PRIVATE_KEY") || ""
);

serve(async (req) => {
  try {
    const payload = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let targetRole = "";
    let notificationPayload = {};

    if (payload.type === "INSERT" && payload.record.status === "pending") {
      targetRole = "chairman";
      notificationPayload = {
        title: "🚨 New Visitor",
        body: `${payload.record.name} is waiting for approval.\nPurpose: ${payload.record.purpose}`,
        url: "/",
      };
    } else if (payload.type === "UPDATE") {
      const oldStatus = payload.old_record?.status;
      const newStatus = payload.record?.status;

      if (oldStatus !== newStatus && ["accepted", "rejected", "waiting"].includes(newStatus)) {
        targetRole = "guard";
        const name = payload.record.name;
        // The edge function triggers on 'visitors' updates.
        // We might not have the user's name joined, but we can assume decided_by is something like 'Chairman Rajan'
        const decidedBy = payload.record.decided_by || 'Chairman';
        
        let title = '';
        let body = '';
        if (newStatus === 'accepted') {
          title = '✅ Visitor Approved';
          body = `${decidedBy} has allowed ${name} to enter.`;
        } else if (newStatus === 'rejected') {
          title = '❌ Visitor Rejected';
          body = `${decidedBy} rejected ${name}.\nReason: ${payload.record.chairman_feedback || 'Not provided'}`;
        } else if (newStatus === 'waiting') {
          title = '⏳ Visitor On Hold';
          body = `${decidedBy} placed ${name} on Hold.\nTime: ${payload.record.hold_duration || 'Unknown'}\nReason: ${payload.record.chairman_feedback || 'Currently unavailable'}`;
        }
        
        notificationPayload = { title, body, url: '/' };
      }
    }

    if (!targetRole) {
      return new Response("No notification required", { status: 200 });
    }

    // Fetch subscriptions
    const { data: subs, error } = await supabase
      .from("notification_subscriptions")
      .select("*")
      .eq("role", targetRole);

    if (error || !subs) {
      console.error("Error fetching subs", error);
      return new Response("Error fetching subs", { status: 500 });
    }

    const promises = subs.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
      } catch (err) {
        console.error("Error sending push to", sub.endpoint, err);
        // If expired or invalid, we could delete it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from("notification_subscriptions").delete().eq("id", sub.id);
        }
      }
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true, count: subs.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
