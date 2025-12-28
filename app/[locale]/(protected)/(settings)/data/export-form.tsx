"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { exportData, type ExportFormat } from "./actions";

export function ExportForm() {
  const t = useTranslations("dataExport");
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportData(format);

      if (result.success && result.data) {
        // Create a blob and download
        const blob = new Blob([result.data], { type: result.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || `user-data.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success(t("toast.exportSuccess"));
      } else {
        toast.error(result.error || t("toast.exportError"));
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("toast.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>{t("formatLabel")}</Label>
          <RadioGroup value={format} onValueChange={(value: string) => setFormat(value as ExportFormat)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2 font-normal cursor-pointer">
                <FileJson className="h-4 w-4" />
                <div>
                  <div className="font-medium">JSON</div>
                  <div className="text-sm text-muted-foreground">{t("formats.json")}</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2 font-normal cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                <div>
                  <div className="font-medium">CSV</div>
                  <div className="text-sm text-muted-foreground">{t("formats.csv")}</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-2">{t("includes.title")}</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>{t("includes.profile")}</li>
            <li>{t("includes.account")}</li>
            <li>{t("includes.preferences")}</li>
            <li>{t("includes.oauth")}</li>
          </ul>
          <p className="mt-3 text-muted-foreground">{t("includes.excluded")}</p>
        </div>

        <Button onClick={handleExport} disabled={isExporting} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? t("exporting") : t("exportButton")}
        </Button>
      </CardContent>
    </Card>
  );
}
