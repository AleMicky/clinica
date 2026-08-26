"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImportarPacientesExcel } from "../hooks/use-pacientes";
import { descargarPlantillaPacientesExcel } from "../api/paciente.api";
import type { ExcelImportResult } from "../types/paciente.types";
import { cn } from "@/lib/utils";

interface PacienteImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PacienteImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: PacienteImportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showColumnsGuide, setShowColumnsGuide] = React.useState(false);
  const [result, setResult] = React.useState<ExcelImportResult | null>(null);

  const [isDownloadingTemplate, setIsDownloadingTemplate] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const importMutation = useImportarPacientesExcel();

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
        toast.success(`Se importaron ${data.importados} pacientes exitosamente.`);
      } else if (data.errores > 0) {
        toast.error("No se pudo importar ningún paciente debido a errores en los datos.");
      } else {
        toast.info("No se registraron nuevos pacientes.");
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
      const blob = await descargarPlantillaPacientesExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plantilla_importacion_pacientes.xlsx");
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
        <div className="relative px-6 py-4.5 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-card border-b border-border/70 pr-12">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs shrink-0">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                Importación Masiva de Pacientes
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Carga un archivo Excel (.xlsx) para registrar múltiples expedientes en el sistema.
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
                    ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
                    : "border-border/80 hover:border-emerald-500/50 hover:bg-muted/40 bg-muted/15",
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

                <div className="size-11 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
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
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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
                      title="Quitar archivo"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Structure Guide Card */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <Info className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Estructura y Formato del Archivo</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDownloadingTemplate}
                      onClick={handleDownloadTemplate}
                      className="h-7 px-2.5 text-[11px] font-medium gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                      title="Descargar plantilla oficial en formato .xlsx"
                    >
                      {isDownloadingTemplate ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Download className="size-3" />
                      )}
                      Descargar Plantilla (.xlsx)
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowColumnsGuide(!showColumnsGuide)}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      {showColumnsGuide ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Las cabeceras deben coincidir exactamente en la primera fila. Formatos de fecha aceptados: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono text-foreground">AAAA-MM-DD</code> o <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono text-foreground">DD/MM/AAAA</code>.
                </p>

                {showColumnsGuide && (
                  <div className="pt-3 border-t border-border/60 space-y-3 animate-in fade-in-50 duration-150">
                    <div>
                      <span className="font-semibold text-foreground text-[11px]">
                        Columnas Obligatorias:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {[
                          "TIPO_DOCUMENTO",
                          "NUMERO_DOCUMENTO",
                          "NOMBRES",
                          "APELLIDO_PATERNO",
                          "FECHA_NACIMIENTO",
                        ].map((col) => (
                          <Badge
                            key={col}
                            variant="secondary"
                            className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5"
                          >
                            {col} *
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-foreground text-[11px]">
                        Columnas Opcionales:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {[
                          "EXTENSION_DOCUMENTO",
                          "COMPLEMENTO_DOCUMENTO",
                          "APELLIDO_MATERNO",
                          "GENERO",
                          "ESTADO_CIVIL",
                          "TELEFONO",
                          "DIRECCION",
                        ].map((col) => (
                          <Badge
                            key={col}
                            variant="outline"
                            className="text-[10px] font-mono text-muted-foreground border-border/80 px-2 py-0.5"
                          >
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-border/80 bg-muted/30 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-muted-foreground">Total Filas</span>
                  <span className="text-xl font-bold text-foreground mt-0.5">
                    {result.total}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Importados
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {result.importados}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1 font-medium">
                    <AlertTriangle className="size-3.5 text-amber-600" />
                    Omitidos
                  </span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {result.omitidos}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1 font-medium">
                    <XCircle className="size-3.5 text-rose-600" />
                    Errores
                  </span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {result.errores}
                  </span>
                </div>
              </div>

              {/* Errors List */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <AlertCircle className="size-4" />
                    <span>Detalle de observaciones y errores ({result.errors.length}):</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border/80 divide-y divide-border/60 bg-card text-xs">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-2.5 flex items-start gap-2.5 hover:bg-muted/30">
                        <Badge
                          variant="destructive"
                          className="shrink-0 text-[10px] px-1.5 py-0 h-5"
                        >
                          Fila {err.row > 0 ? err.row : "General"}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {err.column && (
                              <span className="font-mono text-[11px] font-semibold text-foreground">
                                [{err.column}]
                              </span>
                            )}
                            {err.value && (
                              <span className="text-muted-foreground text-[10px] truncate max-w-[200px]">
                                Valor: &quot;{err.value}&quot;
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-[11px] mt-0.5 leading-tight">
                            {err.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.importados > 0 && result.errors.length === 0 && (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      ¡Importación completada con éxito total!
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Todos los pacientes fueron validados y creados como expedientes clínicos activos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clean Aligned Footer */}
        <div className="px-6 py-3.5 border-t border-border/70 bg-muted/30 flex items-center justify-end gap-2.5 rounded-b-2xl">
          {!result ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={importMutation.isPending}
                onClick={() => handleOpenChange(false)}
                className="h-8.5 px-3.5 text-xs font-medium border-border/80 hover:bg-accent"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={!file || importMutation.isPending}
                onClick={handleUpload}
                className="h-8.5 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-3.5" />
                    <span>Procesar e Importar</span>
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
                className="h-8.5 px-3.5 text-xs font-medium"
              >
                Importar otro archivo
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="h-8.5 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
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
