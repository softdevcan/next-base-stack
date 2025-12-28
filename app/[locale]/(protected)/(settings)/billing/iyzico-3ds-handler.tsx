"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleIyzico3DSCallback } from "./actions-iyzico";

interface Iyzico3DSHandlerProps {
  threeDSHtmlContent: string;
  conversationId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * iyzico 3D Secure Handler Component
 * Renders the 3D Secure HTML form and handles the callback
 */
export function Iyzico3DSHandler({
  threeDSHtmlContent,
  conversationId,
  onSuccess,
  onError,
}: Iyzico3DSHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Inject 3DS HTML content into iframe
    if (containerRef.current) {
      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "600px";
      iframe.style.border = "none";
      iframe.sandbox.add("allow-forms", "allow-scripts", "allow-same-origin", "allow-top-navigation");

      containerRef.current.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(threeDSHtmlContent);
        iframeDoc.close();
      }
    }

    // Listen for 3DS callback (using postMessage or URL redirect)
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "iyzico-3ds-complete") {
        const { paymentId } = event.data;

        // Verify 3DS result
        const result = await handleIyzico3DSCallback({
          conversationId,
          paymentId,
        });

        if (result.error) {
          toast.error(result.error);
          onError?.(result.error);
        } else {
          toast.success("Ödeme başarılı!");
          onSuccess?.();
          router.push("/billing?success=true");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [threeDSHtmlContent, conversationId, onSuccess, onError, router]);

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">3D Secure Doğrulama</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Ödemenizi tamamlamak için lütfen aşağıdaki formu doldurun. Güvenliğiniz için bankadan gelen
          doğrulama kodunu girmeniz gerekebilir.
        </p>
      </div>
      <div ref={containerRef} className="border rounded-lg overflow-hidden" />
    </div>
  );
}
