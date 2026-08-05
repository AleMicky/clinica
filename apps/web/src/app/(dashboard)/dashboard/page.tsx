"use client";

import * as React from "react";
import { Download, Plus, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("overview");

  const userName = user?.nombres ?? user?.userName ?? "Doctor";

  return (
    <div className="flex-1 space-y-6 w-full">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hola, {userName} 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Resumen clínico general y rendimiento de consultas médicas de hoy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium">
            <CalendarIcon className="h-4 w-4" />
            <span>01 Ago, 2026 - 31 Ago, 2026</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-xs font-medium shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Nueva Cita</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="analytics">Analítica Médica</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview (Visión General) */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards Grid */}
          <KpiCards />

          {/* Main Content Grid: Charts + Recent Appointments */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <OverviewChart />
            <RecentAppointments />
          </div>
        </TabsContent>

        {/* Tab 2: Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Analítica Detallada de Consultas</CardTitle>
              <CardDescription>
                Desglose por especialidad médica, tiempos de espera promedio y distribución de pacientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg bg-card space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Tiempo Promedio de Consulta</p>
                  <p className="text-xl font-bold text-foreground">24 Minutos</p>
                </div>
                <div className="p-4 border rounded-lg bg-card space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Tasa de Asistencia a Citas</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">94.2%</p>
                </div>
                <div className="p-4 border rounded-lg bg-card space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Nuevos Pacientes Este Mes</p>
                  <p className="text-xl font-bold text-foreground">+142 Pacientes</p>
                </div>
              </div>
              <OverviewChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Reports */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Reportes Clínicos Exportables</CardTitle>
              <CardDescription>
                Descargue o genere reportes financieros, de flujo de pacientes y prescripciones médicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm">Reporte Consolidado Mensual</h4>
                  <p className="text-xs text-muted-foreground">Formato PDF / Excel • Actualizado hace 2 horas</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm">Resumen de Citas e Ingresos por Médico</h4>
                  <p className="text-xs text-muted-foreground">Formato Excel • Periodo Julio - Agosto 2026</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Notificaciones y Alertas del Sistema</CardTitle>
              <CardDescription>
                Historial de avisos sobre citas, inventarios y recordatorios de laboratorio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg bg-primary/5 flex items-start gap-3">
                <RefreshCw className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Sincronización con Laboratorio completada.</span>
                  <p className="text-muted-foreground">Se recibieron 18 resultados de análisis de sangre.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}