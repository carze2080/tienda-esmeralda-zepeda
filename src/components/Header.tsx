import React from 'react';
import { BoutiqueProfile } from '../types';
import { Volume2, VolumeX, Sparkles, Store, Settings, BellRing, Cloud } from 'lucide-react';

interface HeaderProps {
  profile: BoutiqueProfile;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenClientShop: () => void;
  onSimulateOrder: () => void;
  newOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onToggleSound,
  onOpenSettings,
  onOpenClientShop,
  onSimulateOrder,
  newOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-emerald-900/40 px-3 py-2.5 transition-all shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative group shrink-0">
            <img
              src={profile.logoUrl}
              alt="Logo Esmeralda Zepeda"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400/80 shadow-md bg-stone-950"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-stone-900"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif text-base sm:text-lg font-bold tracking-wide text-amber-200 truncate leading-tight">
                {profile.name}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                Firebase Conectado
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-300 flex items-center gap-1 truncate font-medium">
              <span className="text-emerald-400 font-semibold">{profile.ownerName}</span>
              <span className="hidden xs:inline text-stone-500">•</span>
              <span className="hidden xs:inline text-amber-300/80 text-[10px]">Pelo Rizado & Alta Moda</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Mute / Unmute */}
          <button
            onClick={onToggleSound}
            title={profile.soundEnabled ? 'Notificaciones con sonido activadas' : 'Sonido silenciado'}
            className={`p-2 rounded-xl transition text-xs flex items-center justify-center ${
              profile.soundEnabled
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-800/60'
                : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
            }`}
          >
            {profile.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Quick Simulation Button (Demo Instant Notification) */}
          <button
            onClick={onSimulateOrder}
            title="Simular un pedido entrante de cliente para probar notificación al instante"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-[11px] sm:text-xs shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950 shrink-0" />
            <span className="hidden sm:inline">Simular Pedido</span>
            <span className="sm:hidden">Simular</span>
          </button>

          {/* Client Store Link / View */}
          <button
            onClick={onOpenClientShop}
            title="Ver catálogo interactivo como cliente para recibir pedidos reales"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-[11px] sm:text-xs shadow-sm transition active:scale-95 cursor-pointer border border-emerald-500/30"
          >
            <Store className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span className="hidden sm:inline">Tienda Cliente</span>
            <span className="sm:hidden">Tienda</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Configuración de negocio y perfil"
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
