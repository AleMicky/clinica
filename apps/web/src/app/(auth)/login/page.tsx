import { Activity, Building2, CreditCard, DollarSign, Receipt, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-12 bg-background">
            {/* Left Hero Section - Branding & Medical Sales Highlights */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 bg-slate-950 text-white overflow-hidden">
                {/* Background ambient light effects */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Brand Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                        <Receipt className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">MediServ</h1>
                        <p className="text-xs text-slate-400 font-medium">Venta y Facturación de Servicios Clínicos</p>
                    </div>
                </div>

                {/* Hero Showcase Content */}
                <div className="relative z-10 my-auto max-w-lg space-y-8 py-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/30 px-3.5 py-1 text-xs font-semibold text-primary-foreground/90 backdrop-blur-md">
                            <Sparkles className="size-3.5 text-primary" />
                            <span>Punto de Venta & Caja Médica</span>
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
                            Gestión comercial y venta de servicios para tu clínica
                        </h2>
                        <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
                            Controla la recepción de pacientes, facturación de servicios, tarifarios, convenios y acuerdos médicos con rapidez y total precisión.
                        </p>
                    </div>

                    {/* Feature Grid Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                <CreditCard className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Cobro de Servicios</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Emisión ágil de tickets y facturas</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                                <Tag className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Tarifarios y Convenios</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Catálogo de precios y descuentos</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                                <Building2 className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Recepción y Admisión</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Registro de pacientes e ingresos</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Control de Arqueos</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Seguridad y cuadre de caja</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
                    <span>© {new Date().getFullYear()} MediServ. Todos los derechos reservados.</span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        Caja y Recepción operativas
                    </span>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 md:p-10 lg:p-12 bg-muted/20 relative min-h-screen">
                <div className="w-full max-w-md">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}