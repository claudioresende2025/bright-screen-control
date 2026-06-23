import { QRCodeSVG } from "qrcode.react";
import { Tv, Wifi, LayoutDashboard } from "lucide-react";

interface Props {
  codigo: string;
  painelUrl: string;
}

export function PairingScreen({ codigo, painelUrl }: Props) {
  const grupos = [codigo.slice(0, 3), codigo.slice(3, 6)];

  return (
    <div className="absolute inset-0 bg-black text-white grid place-items-center px-4 sm:px-8 overflow-y-auto py-8">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-[color:var(--color-success)]/15 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col md:grid md:grid-cols-[1fr_auto] items-center gap-8 md:gap-16">
        <div>
          <div className="flex items-center gap-3 text-white/70">
            <div className="h-10 w-10 rounded-xl bg-primary/15 ring-1 ring-primary/40 grid place-items-center text-primary">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">SignageHub Player</p>
              <p className="text-sm">Aguardando vínculo</p>
            </div>
          </div>

          <h1 className="mt-8 md:mt-10 text-lg sm:text-2xl md:text-3xl font-medium text-white/80">
            Para ativar esta TV, digite o código abaixo no painel administrativo:
          </h1>

          <div className="mt-6 md:mt-8 flex items-center justify-center md:justify-start gap-2 sm:gap-4 md:gap-6">
            {grupos.map((g, gi) => (
              <div key={gi} className="flex gap-1.5 sm:gap-2 md:gap-3">
                {g.split("").map((d, di) => (
                  <div
                    key={di}
                    className="h-14 w-10 sm:h-20 sm:w-16 md:h-32 md:w-28 rounded-xl md:rounded-2xl border border-primary/40 bg-primary/10 grid place-items-center font-mono text-3xl sm:text-5xl md:text-7xl font-bold text-primary shadow-[0_0_40px_-10px_rgba(82,130,255,0.6)]"
                  >
                    {d}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-10 flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-white/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-success)] opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--color-success)]" />
            </span>
            Conectado · Aguardando configuração do administrador
            <Wifi className="h-4 w-4 ml-2 text-white/40" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur w-full max-w-[220px]">
          <div className="flex items-center gap-2 text-white/80 text-xs uppercase tracking-wider">
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
            Abrir painel admin
          </div>
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={painelUrl} size={140} />
          </div>
          <p className="text-xs text-white/60 text-center max-w-[180px]">
            Escaneie para abrir o painel e vincular esta TV
          </p>
        </div>
      </div>
    </div>
  );
}