"use client";

import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";
import { ChevronLeft, Github } from "lucide-react";
import BrandLogo from "@/components/store/BrandLogo";

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 h-[100dvh] w-screen bg-white flex flex-col md:flex-row overflow-hidden font-montserrat select-none">
      {}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-50/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-rose-50/40 blur-[100px] pointer-events-none" />

      {}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(244,63,94,0.1),rgba(0,0,0,0))]" />

        <div className="relative z-10 text-center max-w-md space-y-12">
          <BrandLogo variant="light" className="w-56 mx-auto opacity-90" />
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white tracking-tighter leading-tight uppercase italic font-playfair animate-in fade-in slide-in-from-left-4 duration-1000">
              Commencez <br /> l'aventure.
            </h2>
            <div className="h-1 w-12 bg-rose-500 mx-auto rounded-full transition-all duration-700 hover:w-24" />
            <p className="text-gray-400 font-medium leading-relaxed max-w-sm mx-auto opacity-80">
              Créez votre profil et accédez à l'exclusivité Diary Couture en
              quelques clics.
            </p>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-8 max-w-xs mx-auto border-t border-white/5">
            <div className="text-center group">
              <div className="text-white font-black text-2xl group-hover:scale-110 transition-transform tracking-tight">
                Privilège
              </div>
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">
                MEMBRE
              </div>
            </div>
            <div className="text-center group border-l border-white/5 pl-8">
              <div className="text-white font-black text-2xl group-hover:scale-110 transition-transform tracking-tight">
                Accès
              </div>
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">
                ANTICIPÉ
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col relative bg-white h-full">
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="p-6 md:p-8 shrink-0 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20">
            <Link
              href="/shop"
              className="inline-flex items-center text-gray-400 hover:text-black font-black uppercase tracking-widest text-[9px] transition-all group"
            >
              <ChevronLeft
                size={14}
                className="mr-1 group-hover:-translate-x-1 transition-transform"
              />
              <span>Boutique</span>
            </Link>
            <div className="h-px w-8 bg-gray-100 hidden sm:block" />
          </div>

          <div className="flex-grow flex flex-col items-center justify-center px-6 lg:px-24 py-12 animate-in fade-in duration-1000">
            <div className="w-full max-w-[400px] space-y-10">
              <div className="space-y-4 text-left">
                <div className="inline-block px-3 py-1 bg-slate-900/5 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                  Bienvenue
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic font-playfair">
                  Inscription
                </h1>
                <p className="text-gray-400 text-sm font-medium">
                  Rejoignez-nous pour profiter de notre univers.
                </p>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/api/auth/social/login?connection=google-oauth2"
                  className="flex items-center justify-center gap-3 h-12 bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-200 hover:shadow-md transition-all font-bold text-[11px] uppercase tracking-wider text-gray-600 group"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                  Google
                </a>
                <a
                  href="/api/auth/social/login?connection=github"
                  className="flex items-center justify-center gap-3 h-12 bg-slate-950 rounded-xl shadow-lg hover:bg-black transition-all font-bold text-[11px] uppercase tracking-wider text-white group"
                >
                  <Github
                    size={16}
                    className="text-white/70 group-hover:text-white transition-colors"
                  />
                  GitHub
                </a>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                  <span className="px-4 bg-white text-gray-400">
                    Express Registration
                  </span>
                </div>
              </div>

              <div className="animate-in slide-in-from-bottom-2 duration-700 delay-150">
                <RegisterForm />
              </div>

              <div className="text-center border-t border-gray-50 pt-8 mt-4">
                <p className="text-gray-400 text-xs font-medium">
                  Déjà membre ?{" "}
                  <Link
                    href="/login"
                    className="text-black font-black hover:underline underline-offset-4 decoration-2 block sm:inline mt-2 sm:mt-0"
                  >
                    Se connecter maintenant
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 text-center shrink-0">
            <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.3em] opacity-50">
              &copy; {new Date().getFullYear()} DIARY LUXE CO. — TOUS DROITS
              RÉSERVÉS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
