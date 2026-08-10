import { AsignacionEmpleadoModuleView } from "@/modules/recursos-humanos/asignacion-empleado";

export const metadata = {
    title: "Asignaciones de Personal | Recursos Humanos",
    description: "Gestión de asignaciones, transferencias, cargos y áreas de empleados",
};

export default function AsignacionesEmpleadoPage() {
    return <AsignacionEmpleadoModuleView />;
}
