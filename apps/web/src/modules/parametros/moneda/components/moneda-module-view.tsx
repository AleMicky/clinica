"use client"

import * as React from "react"
import { MonedaHeader } from "./moneda-header"
import { MonedaMetricsCards } from "./moneda-metrics"
import { MonedaTable } from "./moneda-table"
import { Moneda, MonedaMetrics as MonedaMetricsType } from "../types/moneda.types"

const initialMonedas: Moneda[] = [
  {
    id: "MON-01",
    codigo: "USD",
    simbolo: "$",
    nombre: "Dólar Estadounidense",
    decimales: 2,
    esMonedaBase: true,
    estado: "Activo",
  },
  {
    id: "MON-02",
    codigo: "EUR",
    simbolo: "€",
    nombre: "Euro",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-03",
    codigo: "COP",
    simbolo: "$",
    nombre: "Peso Colombiano",
    decimales: 0,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-04",
    codigo: "PEN",
    simbolo: "S/",
    nombre: "Sol Peruano",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-05",
    codigo: "CLP",
    simbolo: "$",
    nombre: "Peso Chileno",
    decimales: 0,
    esMonedaBase: false,
    estado: "Inactivo",
  },
  {
    id: "MON-06",
    codigo: "MXN",
    simbolo: "$",
    nombre: "Peso Mexicano",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-07",
    codigo: "BRL",
    simbolo: "R$",
    nombre: "Real Brasileño",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-08",
    codigo: "ARS",
    simbolo: "$",
    nombre: "Peso Argentino",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-09",
    codigo: "UYU",
    simbolo: "$U",
    nombre: "Peso Uruguayo",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-10",
    codigo: "GBP",
    simbolo: "£",
    nombre: "Libra Esterlina",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-11",
    codigo: "CHF",
    simbolo: "CHF",
    nombre: "Franco Suizo",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-12",
    codigo: "JPY",
    simbolo: "¥",
    nombre: "Yen Japonés",
    decimales: 0,
    esMonedaBase: false,
    estado: "Inactivo",
  },
]

export function MonedaModuleView() {
  const [monedas, setMonedas] = React.useState<Moneda[]>(initialMonedas)

  const baseMoneda = monedas.find((m) => m.esMonedaBase)
  const metrics: MonedaMetricsType = {
    monedaBase: baseMoneda ? `${baseMoneda.codigo} (${baseMoneda.simbolo})` : "USD ($)",
    monedasHabilitadas: monedas.filter((m) => m.estado === "Activo").length,
    facturacionMultimoneda: true,
    monedasInactivas: monedas.filter((m) => m.estado === "Inactivo").length,
  }

  const handleSetMonedaBase = (id: string) => {
    setMonedas((prev) =>
      prev.map((m) => ({
        ...m,
        esMonedaBase: m.id === id,
      }))
    )
  }

  const handleInactivate = (id: string) => {
    setMonedas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, estado: "Inactivo" } : m))
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <MonedaHeader onAddClick={() => alert("Formulario Agregar Moneda")} />
      <MonedaMetricsCards metrics={metrics} />
      <MonedaTable
        monedas={monedas}
        onSetMonedaBase={handleSetMonedaBase}
        onInactivate={handleInactivate}
      />
    </div>
  )
}
