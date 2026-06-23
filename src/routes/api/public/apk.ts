import { createFileRoute } from "@tanstack/react-router";

// Public stable endpoint that always serves the latest uploaded APK.
// The QR Code and "Baixar APK" buttons can point here without ever changing.
// Internally, it generates a short-lived signed URL for the private "apks"
// bucket and 302-redirects to it. The browser follows the redirect and
// downloads the file — Android Chrome treats .apk responses as a download.
export const Route = createFileRoute("/api/public/apk")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const FILE_PATH = "signagehub-player.apk";

        const { data, error } = await supabaseAdmin.storage
          .from("apks")
          .createSignedUrl(FILE_PATH, 60 * 10, {
            download: FILE_PATH,
          });

        if (error || !data?.signedUrl) {
          return new Response(
            "APK ainda não publicado. Acesse o painel em Configurações para enviar.",
            {
              status: 404,
              headers: { "content-type": "text/plain; charset=utf-8" },
            },
          );
        }

        return new Response(null, {
          status: 302,
          headers: {
            location: data.signedUrl,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});