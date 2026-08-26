import { Building2, CreditCard, Receipt, ShieldCheck, Sparkles, Tag } from "lucide-react";

interface FeatureCardItem {
    title: string;
    description: string;
    icon: typeof CreditCard;
    iconBg: string;
    iconColor: string;
}

const FEATURES: FeatureCardItem[] = [
    {
        title: "Cobro de Servicios",
        description: "Emisión ágil de tickets y facturas",
        icon: CreditCard,
        iconBg: "bg-primary/20",
        iconColor: "text-primary",
    },
    {
        title: "Tarifarios y Convenios",
        description: "Catálogo de precios y descuentos",
        icon: Tag,
        iconBg: "bg-emerald-500/20",
        iconColor: "text-emerald-400",
    },
    {
        title: "Recepción y Admisión",
        description: "Registro de pacientes e ingresos",
        icon: Building2,
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-400",
    },
    {
        title: "Control de Arqueos",
        description: "Seguridad y cuadre de caja",
        icon: ShieldCheck,
        iconBg: "bg-rose-500/20",
        iconColor: "text-rose-400",
    },
];

export function LoginHero() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 bg-slate-950 text-white overflow-hidden">
            {/* Ambient Background Light Effects */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

            {/* Brand Header */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Receipt className="size-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Atenea Servicios</h1>
                    <p className="text-xs text-slate-400 font-medium">Sistema de Ventas de Servicios</p>
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
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors"
                            >
                                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${feature.iconBg} ${feature.iconColor}`}>
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Info */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
                <span>© {currentYear} Atenea Servicios. Todos los derechos reservados.</span>
                <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Caja y Recepción operativas
                </span>
            </div>
        </div>
    );
}
