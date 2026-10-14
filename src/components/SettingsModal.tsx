import React, { useState } from 'react';
import { BoutiqueProfile } from '../types';
import { AVAILABLE_LOGOS, SUGGESTED_NAMES } from '../utils/storage';
import { 
  X, Settings, ShieldCheck, Phone, MapPin, Volume2, 
  Smartphone, User, Check, Sparkles, Database, Download, 
  Upload, Trash2, GitBranch, Copy, ExternalLink, Image as ImageIcon
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BoutiqueProfile;
  onSaveProfile: (profile: BoutiqueProfile) => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onExportBackup,
  onImportBackup,
  onClearAllData,
}) => {
  const [name, setName] = useState(profile.name);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [selectedLogo, setSelectedLogo] = useState(profile.logoUrl);
  const [rfc, setRfc] = useState(profile.rfc);
  const [fiscalRegime, setFiscalRegime] = useState(profile.fiscalRegime);
  const [phone, setPhone] = useState(profile.phone);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [address, setAddress] = useState(profile.address);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState(profile.vibrationEnabled);

  const [activeTab, setActiveTab] = useState<'marca' | 'datos' | 'github'>('marca');
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name,
      ownerName,
      logoUrl: selectedLogo,
      rfc: rfc.toUpperCase(),
      fiscalRegime,
      phone,
      whatsapp,
      address,
      soundEnabled,
      vibrationEnabled,
    });
    onClose();
  };

  const gitCommands = `git init
git add .
git commit -m "Inicializar mi tienda boutique online - Esmeralda Zepeda"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tienda-esmeralda-zepeda.git
git push -u origin main`;

  const copyGitCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Personalización & Configuración
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation inside Settings */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-bold text-stone-600 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('marca')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'marca'
                ? 'border-emerald-700 text-emerald-900 font-extrabold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            🎨 Nombre & Logo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'datos'
                ? 'border-emerald-700 text-emerald-900 font-extrabold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            ⚙️ Datos & Respaldo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'github'
                ? 'border-emerald-700 text-emerald-900 font-extrabold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-stone-700" />
            <span>Subir a GitHub</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'marca' && (
            <div className="space-y-4">
              {/* Selected Logo & Header Live Preview */}
              <div className="bg-gradient-to-r from-stone-950 via-emerald-950 to-stone-900 text-white rounded-2xl p-4 border border-amber-400/40 flex items-center gap-3.5 shadow-sm">
                <img
                  src={selectedLogo}
                  alt="Logo Seleccionado"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md shrink-0 bg-stone-900"
                />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-300">
                    Previsualización de tu Marca
                  </span>
                  <h4 className="font-serif text-lg font-bold text-white truncate leading-tight">
                    {name}
                  </h4>
                  <p className="text-xs text-stone-300">
                    {ownerName} • Moda & Pelo Rizado
                  </p>
                </div>
              </div>

              {/* Name suggestions */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nombre de tu Tienda / Boutique
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  placeholder="Ej. AURA by Esmeralda Zepeda"
                />

                <div className="mt-2">
                  <span className="text-[11px] font-bold text-emerald-900 block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Nombres sugeridos para tu boutique (toca para elegir):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_NAMES.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setName(sug)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                          name === sug
                            ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                            : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-emerald-50 hover:border-emerald-500'
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  Elige tu Logo Oficial para la Tienda y Facturas:
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {AVAILABLE_LOGOS.map((logo) => {
                    const isSelected = selectedLogo === logo.url;
                    return (
                      <div
                        key={logo.id}
                        onClick={() => setSelectedLogo(logo.url)}
                        className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                        }`}
                      >
                        <img
                          src={logo.url}
                          alt={logo.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full object-cover border border-stone-300 shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-bold text-stone-900 truncate flex items-center gap-1.5">
                            {logo.name}
                            {isSelected && (
                              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                                Activo
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                            {logo.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'datos' && (
            <div className="space-y-4">
              {/* Contact info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Información de Contacto
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Dirección de Boutique / Showroom
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Fiscal CFDI */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Facturación Electrónica (SAT)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">RFC</label>
                    <input
                      type="text"
                      required
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Régimen</label>
                    <input
                      type="text"
                      required
                      value={fiscalRegime}
                      onChange={(e) => setFiscalRegime(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Clean all data button */}
              <div className="pt-3 border-t border-red-200 bg-red-50/60 p-3.5 rounded-xl border space-y-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <p className="text-xs font-bold text-red-900">
                    Limpiar Toda la Base de Datos (Empezar en Blanco)
                  </p>
                </div>
                <p className="text-[11px] text-red-800 leading-snug">
                  Borra todos los pedidos, facturas y prendas de ejemplo para que puedas comenzar a registrar tus prendas reales desde cero.
                </p>
                {onClearAllData && (
                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar todos los datos y dejar app limpia</span>
                  </button>
                )}
              </div>

              {/* Backup & Restore */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                <p className="text-[11px] font-bold text-stone-700">Copias de Seguridad</p>
                <div className="flex flex-wrap gap-2">
                  {onExportBackup && (
                    <button
                      type="button"
                      onClick={onExportBackup}
                      className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Descargar Respaldo JSON</span>
                    </button>
                  )}
                  {onImportBackup && (
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Restaurar Respaldo</span>
                      <input type="file" accept=".json" onChange={onImportBackup} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4 text-xs">
              <div className="bg-stone-900 text-stone-100 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-sm">¿Cómo subir tu tienda a GitHub?</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyGitCommands}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg border border-stone-700 transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedGitCmd ? '¡Copiado!' : 'Copiar comandos'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Para tener el código seguro en tu propia cuenta de GitHub y vincularlo a tu dominio:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-stone-300 text-[11px] pt-1">
                  <li>Entra a <a href="https://github.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">GitHub.com</a> y crea un nuevo repositorio llamado <span className="font-mono text-emerald-300">tienda-esmeralda-zepeda</span>.</li>
                  <li>No marques "Initialize with README".</li>
                  <li>Abre tu terminal en la carpeta del proyecto y ejecuta estos comandos:</li>
                </ol>

                <pre className="bg-stone-950 p-3 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed border border-stone-800">
                  {gitCommands}
                </pre>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-950 space-y-1">
                <p className="font-bold text-xs">🚀 Publicar tu tienda en internet con tu propio dominio</p>
                <p className="text-[11px] text-stone-600">
                  Una vez que subas tu código a GitHub, puedes vincularlo gratis con <strong>Vercel</strong> o <strong>Netlify</strong> para tener tu propia tienda online accesible desde cualquier parte del mundo con HTTPS.
                </p>
              </div>
            </div>
          )}

          {/* Footer Save */}
          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
