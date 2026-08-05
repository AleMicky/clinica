"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecentAppointment {
  id: string;
  patientName: string;
  email: string;
  avatar?: string;
  initials: string;
  specialty: string;
  amount: string;
  status: "Completado" | "En Progreso" | "Pendiente" | "Cancelado";
  time: string;
}

const appointments: RecentAppointment[] = [
  {
    id: "1",
    patientName: "Olivia Martin",
    email: "olivia.martin@email.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    initials: "OM",
    specialty: "Medicina General",
    amount: "Bs. 250.00",
    status: "Completado",
    time: "09:30 AM",
  },
  {
    id: "2",
    patientName: "Jackson Lee",
    email: "jackson.lee@email.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    initials: "JL",
    specialty: "Cardiología",
    amount: "Bs. 400.00",
    status: "En Progreso",
    time: "10:15 AM",
  },
  {
    id: "3",
    patientName: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    initials: "IN",
    specialty: "Pediatría",
    amount: "Bs. 300.00",
    status: "Pendiente",
    time: "11:00 AM",
  },
  {
    id: "4",
    patientName: "William Kim",
    email: "william.kim@email.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    initials: "WK",
    specialty: "Dermatología",
    amount: "Bs. 350.00",
    status: "Completado",
    time: "11:45 AM",
  },
  {
    id: "5",
    patientName: "Sofia Davis",
    email: "sofia.davis@email.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    initials: "SD",
    specialty: "Ginecología",
    amount: "Bs. 450.00",
    status: "Pendiente",
    time: "02:30 PM",
  },
];

function getStatusBadge(status: RecentAppointment["status"]) {
  switch (status) {
    case "Completado":
      return <Badge variant="success">Completado</Badge>;
    case "En Progreso":
      return <Badge variant="info">En Progreso</Badge>;
    case "Pendiente":
      return <Badge variant="warning">Pendiente</Badge>;
    case "Cancelado":
      return <Badge variant="destructive">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function RecentAppointments() {
  return (
    <Card className="col-span-3 border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Citas y Pacientes Recientes</CardTitle>
          <CardDescription>
            Ha registrado 265 citas este mes.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {appointments.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={item.avatar} alt={item.patientName} />
                  <AvatarFallback>{item.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium leading-none truncate text-foreground">
                    {item.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.specialty} • {item.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(item.status)}
                <span className="text-sm font-semibold text-foreground hidden sm:inline-block">
                  {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
