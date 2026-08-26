import { LoginForm } from "@/modules/auth/components/login-form";
import { LoginHero } from "@/modules/auth/components/login-hero";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-12 bg-background">
            {/* Sección Lateral Hero / Branding */}
            <LoginHero />

            {/* Contenedor del Formulario de Acceso */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 md:p-10 lg:p-12 bg-muted/20 relative min-h-screen">
                <div className="w-full max-w-md">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}