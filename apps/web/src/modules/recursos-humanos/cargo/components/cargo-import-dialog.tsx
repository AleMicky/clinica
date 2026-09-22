"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  X,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImportarCargosExcel } from "../hooks/use-cargos";
import { descargarPlantillaCargosExcel } from "../api/cargo.api";
import type { ExcelImportResult } from "../types/cargo.types";
import { cn } from "@/lib/utils";

interface CargoImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CargoImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: CargoImportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showColumnsGuide, setShowColumnsGuide] = React.useState(false);
  const [result, setResult] = React.useState<ExcelImportResult | null>(null);

  const [isDownloadingTemplate, setIsDownloadingTemplate] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const importMutation = useImportarCargosExcel();

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && result?.importados && result.importados > 0) {
      onSuccess?.();
    }
    if (!newOpen) {
      handleReset();
    }
    onOpenChange(newOpen);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Formato inválido. Solo se admiten archivos Excel (.xlsx).");
      return;
    }

    // Limit to 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("El archivo excede el tamaño máximo permitido de 10 MB.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo .xlsx primero.");
      return;
    }

    try {
      const data = await importMutation.mutateAsync(file);
      setResult(data);

      if (data.importados > 0) {
        toast.success(`Se importaron ${data.importados} cargos exitosamente.`);
      } else if (data.errors && data.errors.length > 0) {
        toast.error("No se pudo importar ningún cargo debido a errores en los datos.");
      } else {
        toast.info("No se registraron nuevos cargos.");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Ocurrió un error al procesar el archivo Excel.";
      toast.error(errorMsg);
    }
  };

  // Descarga directa de la plantilla Excel oficial (.xlsx)
  const handleDownloadTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloadingTemplate(true);
      const blob = await descargarPlantillaCargosExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plantilla_importacion_cargos.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Plantilla Excel (.xlsx) descargada correctamente.");
    } catch {
      toast.error("No se pudo descargar la plantilla Excel.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col overflow-hidden border border-border/80 shadow-2xl rounded-2xl bg-card">
        {/* Header Visual Banner */}
        <div className="relative px-6 py-4.5 bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-card border-b border-border/70 pr-12">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-xs shrink-0">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                Importación Masiva de Cargos
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Carga un archivo Excel (.xlsx) para registrar puestos y cargos laborales en bloque.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto">
          {!result ? (
            <>
              {/* Dropzone Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !importMutation.isPending && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
                  isDragging
                    ? "border-blue-500 bg-blue-500/10 scale-[0.99]"
                    : "border-border/80 hover:border-blue-500/50 hover:bg-muted/40 bg-muted/15",
                  importMutation.isPending && "pointer-events-none opacity-60"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <div className="size-11 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-2xs">
                  <UploadCloud className="size-5.5" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    Haz clic para seleccionar o arrastra tu archivo Excel
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Formato admitido: <strong className="text-foreground">.xlsx</strong> (máximo 10 MB)
                  </p>
                </div>
              </div>

              {/* Selected File Card */}
              {file && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileCheck className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {!importMutation.isPending && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Plantilla & Guía de Columnas */}
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="size-4 text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Estructura y Formato del Archivo
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    disabled={isDownloadingTemplate}
                    className="h-7 text-xs gap-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-medium cursor-pointer"
                  >
                    {isDownloadingTemplate ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    Descargar Plantilla Oficial (.xlsx)
                  </Button>
                </div>

                <div className="border-t border-border/60 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowColumnsGuide(!showColumnsGuide)}
                    className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground font-medium py-1 transition-colors cursor-pointer"
                  >
                    <span>Ver especificación de columnas requeridas (3 campos)</span>
                    {showColumnsGuide ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>

                  {showColumnsGuide && (
                    <div className="mt-2.5 space-y-2 text-[11px] text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/60 animate-in fade-in-50 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-background border border-border/50">
                          <span className="font-semibold text-foreground">CODIGO</span>{" "}
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-rose-500/30 text-rose-500">
                            Obligatorio
                          </Badge>
                          <p className="mt-0.5 text-muted-foreground text-[10px]">
                            Código alfanumérico único (máx. 20 caracteres). Ej: <code>MED-GRAL</code>, <code>ENF-JEFE</code>.
                          </p>
                        </div>
                        <div className="p-2 rounded bg-background border border-border/50">
                          <span className="font-semibold text-foreground">NOMBRE</span>{" "}
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-rose-500/30 text-rose-500">
                            Obligatorio
                          </Badge>
                          <p className="mt-0.5 text-muted-foreground text-[10px]">
                            Nombre descriptivo del cargo (máx. 100 caracteres). Ej: <code>Médico General</code>.
                          </p>
                        </div>
                        <div className="p-2 rounded bg-background border border-border/50 sm:col-span-2">
                          <span className="font-semibold text-foreground">DESCRIPCION</span>{" "}
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-muted-foreground/30 text-muted-foreground">
                            Opcional
                          </Badge>
                          <p className="mt-0.5 text-muted-foreground text-[10px]">
                            Detalle de funciones, responsabilidades o perfil del cargo (máx. 250 caracteres).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Resultados de la importación */
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Metric Cards Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl border border-border/70 bg-card text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Filas
                  </span>
                  <p className="text-xl font-bold text-foreground mt-0.5">
                    {result.total}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Importados
                  </span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {result.importados}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Omitidos
                  </span>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {result.omitidos}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 text-center">
                  <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Errores
                  </span>
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {result.errors.length}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              {result.importados > 0 && result.errors.length === 0 && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-semibold">¡Importación completada con éxito!</p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      Todos los {result.importados} cargos se registraron correctamente en el sistema.
                    </p>
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Detalle de Errores Encontrados ({result.errors.length})</span>
                  </div>

                  <div className="max-h-52 overflow-y-auto rounded-xl border border-rose-500/20 bg-card">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold sticky top-0 border-b border-rose-500/20">
                        <tr>
                          <th className="py-2 px-3">Fila</th>
                          <th className="py-2 px-3">Columna</th>
                          <th className="py-2 px-3">Valor</th>
                          <th className="py-2 px-3">Mensaje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {result.errors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-muted/40 transition-colors">
                            <td className="py-2 px-3 font-mono font-semibold text-foreground">
                              {err.row > 0 ? `#${err.row}` : "General"}
                            </td>
                            <td className="py-2 px-3 font-medium text-foreground">
                              {err.column || "-"}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground truncate max-w-[120px]">
                              {err.value || "-"}
                            </td>
                            <td className="py-2 px-3 text-rose-600 dark:text-rose-400">
                              {err.message}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-muted/30 border-t border-border/70 flex items-center justify-between gap-2">
          {!result ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={importMutation.isPending}
                className="h-8 text-xs cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={!file || importMutation.isPending}
                className="h-8 px-4 text-xs font-semibold gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs shadow-blue-500/20 cursor-pointer"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Procesando Archivo...
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-3.5" />
                    Iniciar Importación
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs cursor-pointer"
              >
                Importar Otro Archivo
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="h-8 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Finalizar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
