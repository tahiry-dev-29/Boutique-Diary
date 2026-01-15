import { Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import StoreTypewriter from "./StoreTypewriter";

interface Customer {
  id: number;
  username: string;
  photo?: string | null;
}

interface StoreProductBannerProps {
  title: string;
  subtitle: string;
  badge: string;
  customerCount: number;
  recentCustomers?: Customer[];
  variant?: "indigo" | "rose" | "amber" | "cyan" | "emerald";
  enableTypewriter?: boolean;
}

export default function StoreProductBanner({
  title,
  subtitle,
  badge,
  customerCount,
  recentCustomers = [],
  variant = "indigo",
  enableTypewriter = false,
}: StoreProductBannerProps) {
  const variantStyles = {
    indigo: {
      bg: "bg-slate-900",
      blobs: ["bg-purple-600", "bg-indigo-600", "bg-rose-500"],
      textGradient: "from-amber-200 via-rose-200 to-indigo-200",
    },
    rose: {
      bg: "bg-rose-950",
      blobs: ["bg-rose-600", "bg-pink-600", "bg-orange-500"],
      textGradient: "from-rose-100 via-pink-100 to-orange-100",
    },
    amber: {
      bg: "bg-amber-950",
      blobs: ["bg-amber-600", "bg-yellow-600", "bg-orange-500"],
      textGradient: "from-amber-100 via-yellow-100 to-orange-100",
    },
    cyan: {
      bg: "bg-cyan-950",
      blobs: ["bg-cyan-600", "bg-sky-600", "bg-indigo-500"],
      textGradient: "from-cyan-100 via-sky-100 to-indigo-100",
    },
    emerald: {
      bg: "bg-emerald-950",
      blobs: ["bg-emerald-600", "bg-teal-600", "bg-lime-500"],
      textGradient: "from-emerald-100 via-teal-100 to-lime-100",
    },
  };

  const currentVariant = variantStyles[variant];

  const formatCount = (count: number) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-[2.5rem] overflow-hidden mb-12 group shadow-2xl transition-all duration-700 hover:shadow-cyan-900/10",
        currentVariant.bg,
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-40">
          <div
            className={cn(
              "absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] animate-pulse mix-blend-screen",
              currentVariant.blobs[0],
            )}
          />
          <div
            className={cn(
              "absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] animate-pulse delay-700 mix-blend-screen",
              currentVariant.blobs[1],
            )}
          />
          <div
            className={cn(
              "absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-bounce mix-blend-screen duration-[12000ms]",
              currentVariant.blobs[2],
            )}
          />
        </div>

        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-6 py-10 md:py-14 lg:py-16 flex flex-col items-center text-center">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-background rounded-full opacity-30 blur-[1px]"
              style={{
                top: `${(i * 13) % 100}%`,
                left: `${(i * 21) % 100}%`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl space-y-6 relative">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-background/5 backdrop-blur-xl border border-white/10 text-white/90 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <div className="absolute inset-0 blur-sm bg-amber-400 opacity-50" />
            </div>
            <span>{badge}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
            {title.split(" ").map((word, i) => (
              <span key={i} className="inline-block mr-4 last:mr-0">
                {word === "Produits" ||
                word === "Promotions" ||
                word === "Journal" ||
                word === "Nouveautés" ? (
                  <span
                    className={cn(
                      "bg-gradient-to-r bg-clip-text text-transparent italic",
                      currentVariant.textGradient,
                    )}
                  >
                    {word}
                  </span>
                ) : (
                  word
                )}
              </span>
            ))}
          </h1>

          <p className="text-sm md:text-lg lg:text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both group-hover:text-white/80 transition-colors">
            {enableTypewriter ? (
              <StoreTypewriter text={subtitle} delay={1000} speed={40} />
            ) : (
              subtitle
            )}
          </p>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700 fill-mode-both">
            <div className="flex items-center gap-5 px-6 py-4 rounded-[2rem] bg-slate-900/40 border border-white/10 backdrop-blur-3xl transition-all hover:bg-background/10 hover:scale-[1.02] active:scale-95 group/stats shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex -space-x-4">
                {recentCustomers.length > 0
                  ? recentCustomers.map((customer, i) => (
                      <div
                        key={customer.id}
                        className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl transition-transform group-hover/stats:-translate-y-1"
                        style={{ zIndex: 10 - i }}
                      >
                        <img
                          src={
                            customer.photo ||
                            `https://i.pravatar.cc/150?u=${customer.id}`
                          }
                          alt={customer.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  : [1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl transition-transform group-hover/stats:-translate-y-1"
                        style={{ zIndex: 10 - i }}
                      >
                        <img
                          src={`https://i.pravatar.cc/150?u=${i + 100}`}
                          alt="Client"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
              </div>
              <div className="text-left">
                <div className="text-white font-black text-xl leading-tight tracking-tight">
                  +{formatCount(customerCount)} clients
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
                    Certifiés satisfaits
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-background/20" />

            <div className="flex items-center gap-3 text-white/40 font-bold text-xs uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span>Style & Tendances 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent z-0 opacity-50" />
    </div>
  );
}
