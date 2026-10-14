import React, { useState } from 'react';
import { BoutiqueProfile } from '../types';
import { SUGGESTED_NAMES } from '../utils/storage';
import { 
  Volume2, VolumeX, Sparkles, Store, Settings, Cloud, 
  Pencil, Check, X 
} from 'lucide-react';

interface HeaderProps {
  profile: BoutiqueProfile;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenClientShop: () => void;
  onSimulateOrder: () => void;
  onUpdateName?: (newName: string) => void;
  newOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onToggleSound,
  onOpenSettings,
  onOpenClientShop,
  onSimulateOrder,
  onUpdateName,
  newOrdersCount,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  const handleSaveName = (nameToSave: string) => {
    if (onUpdateName && nameToSave.trim()) {
      onUpdateName(nameToSave.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-emerald-900/40 px-3 py-2.5 transition-all shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            onClick={onOpenSettings} 
            title="Toca para cambiar logo o configuración"
            className="relative group shrink-0 cursor-pointer"
          >
            <img
              src={profile.logoUrl}
              alt="Logo Esmeralda Zepeda"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400/80 shadow-md bg-stone-950 group-hover:scale-105 transition"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-stone-900"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setTempName(profile.name);
                  setIsEditingName(true);
                }}
                title="Toca para cambiar el nombre de tu tienda"
                className="font-serif text-base sm:text-lg font-bold tracking-wide text-amber-200 truncate leading-tight hover:text-amber-100 flex items-center gap-1.5 cursor-pointer text-left"
              >
                <span>{profile.name}</span>
                <Pencil className="w-3 h-3 text-amber-400/70 hover:text-amber-300 shrink-0" />
              </button>

              <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                Cloud Firestore
              </span>

              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-full">
                💵 USD $
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-300 flex items-center gap-1 truncate font-medium">
              <span className="text-amber-400 font-bold">👑 Portal de la Dueña:</span>
              <span className="text-stone-200 font-semibold">{profile.ownerName}</span>
              <span className="hidden xs:inline text-stone-500">•</span>
              <span className="hidden xs:inline text-amber-300/80 text-[10px]">Pelo Rizado & Alta Confección</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Mute / Unmute */}
          <button
            onClick={onToggleSound}
            title={profile.soundEnabled ? 'Notificaciones con sonido activadas' : 'Sonido silenciado'}
            className={`p-2 rounded-xl transition text-xs flex items-center justify-center cursor-pointer ${
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
            title="Simular un pedido entrante de cliente en USD para probar notificación al instante"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-[11px] sm:text-xs shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950 shrink-0" />
            <span>Simular Pedido</span>
          </button>

          {/* Client Portal Switcher Button */}
          <button
            onClick={onOpenClientShop}
            title="Ver y abrir el Portal de Clientes (Tienda Online) para clientas"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-[11px] sm:text-xs shadow-md transition active:scale-95 cursor-pointer border border-emerald-400/40"
          >
            <Store className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">🛍️ Portal de Clientes</span>
            <span className="sm:hidden">Tienda Clientes</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Configuración de negocio, logos, moneda USD y respaldo"
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Name Change Modal Popup */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md p-4 text-stone-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 font-serif">
                <Pencil className="w-4 h-4 text-amber-400" />
                Cambiar Nombre de tu Tienda
              </h3>
              <button
                onClick={() => setIsEditingName(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-stone-400 block mb-1">
                Escribe el nuevo nombre de tu tienda:
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Ej. AURA by Esmeralda Zepeda"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-sm font-bold text-amber-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-400 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                O selecciona uno de estos nombres sugeridos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_NAMES.map((nameOpt) => (
                  <button
                    key={nameOpt}
                    type="button"
                    onClick={() => handleSaveName(nameOpt)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-emerald-800 text-stone-200 hover:text-white border border-stone-700 transition cursor-pointer"
                  >
                    {nameOpt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveName(tempName)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aplicar Nombre</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
