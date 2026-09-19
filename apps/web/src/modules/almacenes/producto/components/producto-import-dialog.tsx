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
  Package,
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
import { useImportarProductosExcel } from "../hooks/use-producto";
import { descargarPlantillaProductosExcel } from "../api/producto.api";
import type { ExcelImportResult } from "../types/producto.types";
import { cn } from "@/lib/utils";

interface ProductoImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductoImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ProductoImportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showColumnsGuide, setShowColumnsGuide] = React.useState(false);
  const [result, setResult] = React.useState<ExcelImportResult | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const importMutation = useImportarProductosExcel();

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

    // Limite a 10MB
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
        toast.success(`Se importaron ${data.importados} productos exitosamente.`);
      } else if (data.errores > 0) {
        toast.error("No se pudo importar ningún producto debido a errores en los datos.");
      } else {
        toast.info("No se registraron nuevos productos.");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Ocurrió un error al procesar el archivo Excel.";
      toast.error(errorMsg);
    }
  };

  const handleDownloadTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloadingTemplate(true);
      const blob = await descargarPlantillaProductosExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plantilla_importacion_productos.xlsx");
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
        <div className="relative px-6 py-4.5 bg-gradient-to-r from-primary/15 via-primary/5 to-card border-b border-border/70 pr-12">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-xs shrink-0">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                Importación Masiva de Productos
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Carga un archivo Excel (.xlsx) para registrar productos y sus lotes iniciales en el catálogo.
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
                    ? "border-primary bg-primary/10 scale-[0.99]"
                    : "border-border/80 hover:border-primary/50 hover:bg-muted/40 bg-muted/15",
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

                <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-2xs">
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
                <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
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
                      className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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
                    <Info className="size-4 text-primary shrink-0" />
                    <span>Estructura y Columnas del Archivo</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDownloadingTemplate}
                      onClick={handleDownloadTemplate}
                      className="h-7 px-2.5 text-[11px] font-medium gap-1 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
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
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showColumnsGuide ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {showColumnsGuide && (
                  <div className="pt-2 border-t border-border/60 text-[11px] space-y-2 text-muted-foreground animate-in fade-in-50 duration-200">
                    <p>
                      El archivo <strong className="text-foreground">.xlsx</strong> debe contener una hoja con las siguientes cabeceras en la primera fila:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Package className="size-3 text-primary" /> Datos del Producto
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                          <li><span className="font-mono text-foreground font-semibold">CODIGO</span>: Código único (Obligatorio)</li>
                          <li><span className="font-mono text-foreground font-semibold">NOMBRE</span>: Nombre comercial (Obligatorio)</li>
                          <li><span className="font-mono text-foreground font-semibold">CATEGORIA</span>: Nombre o ID de categoría (Obligatorio)</li>
                          <li><span className="font-mono text-foreground font-semibold">UNIDAD_MEDIDA</span>: Nombre o símbolo (Obligatorio)</li>
                          <li><span className="font-mono">DESCRIPCION</span>: Detalle opcional</li>
                          <li><span className="font-mono">CONTROLA_LOTE</span>: SI / NO</li>
                          <li><span className="font-mono">CONTROLA_VENCIMIENTO</span>: SI / NO</li>
                          <li><span className="font-mono">STOCK_MINIMO</span> / <span className="font-mono">STOCK_MAXIMO</span></li>
                        </ul>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Package className="size-3 text-primary" /> Lote Inicial (Opcional)
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                          <li><span className="font-mono">NUMERO_LOTE</span>: Código de lote inicial</li>
                          <li><span className="font-mono">FECHA_FABRICACION</span>: AAAA-MM-DD</li>
                          <li><span className="font-mono">FECHA_VENCIMIENTO</span>: AAAA-MM-DD</li>
                          <li><span className="font-mono">COSTO_UNITARIO</span>: Monto numérico</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Summary Stats Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl border border-border/70 bg-muted/30 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Filas</span>
                  <span className="text-lg font-bold text-foreground">{result.total}</span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">Importados</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{result.importados}</span>
                </div>
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400">Omitidos</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{result.omitidos}</span>
                </div>
                <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-semibold text-destructive">Con Error</span>
                  <span className="text-lg font-bold text-destructive">{result.errores}</span>
                </div>
              </div>

              {/* Status Outcome Banner */}
              {result.importados > 0 && result.errores === 0 && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Todos los productos fueron importados satisfactoriamente.</span>
                </div>
              )}

              {result.importados > 0 && result.errores > 0 && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Se importaron {result.importados} productos, pero algunas filas contenían inconsistencias.</span>
                </div>
              )}

              {result.importados === 0 && result.errores > 0 && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs">
                  <XCircle className="size-4 shrink-0" />
                  <span>No se pudo importar ningún producto. Revisa el listado de errores a continuación.</span>
                </div>
              )}

              {/* Errors Detail Table */}
              {result.errors && result.errors.length > 0 && (
                <div className="rounded-xl border border-destructive/30 overflow-hidden">
                  <div className="px-3.5 py-2 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      Detalle de Errores ({result.errors.length})
                    </span>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-border/60">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-2.5 text-[11px] flex items-start gap-2 hover:bg-muted/30 transition-colors">
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-destructive/40 text-destructive shrink-0 mt-0.5">
                          Fila {err.row}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground font-medium">{err.message}</p>
                          {(err.column || err.value) && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {err.column && <span className="font-mono text-primary font-semibold mr-2">Columna: {err.column}</span>}
                              {err.value && <span className="font-mono">Valor: &quot;{err.value}&quot;</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-muted/20 border-t border-border/70 flex items-center justify-between gap-2">
          {!result ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={importMutation.isPending}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={!file || importMutation.isPending}
                className="gap-1.5 font-medium cursor-pointer"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-3.5" />
                    <span>Iniciar Importación</span>
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
                className="cursor-pointer"
              >
                Importar otro archivo
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer"
              >
                Finalizar y Cerrar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
