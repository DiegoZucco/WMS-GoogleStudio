import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  X 
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const NotificationToasts: React.FC = () => {
  const { notifications, dismissNotification } = useInventory();

  // Auto-dismiss oldest notification after 5 seconds
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      dismissNotification(notifications[notifications.length - 1].id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [notifications, dismissNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map(notif => {
        const isCritical = notif.type === 'critical';
        const isWarning = notif.type === 'warning';
        const isSuccess = notif.type === 'success';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3 rounded-lg shadow-lg border text-xs flex items-start gap-2.5 transition-all transform translate-y-0 ${
              isCritical
                ? 'bg-rose-900 text-white border-rose-800'
                : isWarning
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : isSuccess
                ? 'bg-emerald-900 text-white border-emerald-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isCritical ? (
                <ShieldAlert className="w-4 h-4 text-rose-300" />
              ) : isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              ) : (
                <Info className="w-4 h-4 text-indigo-300" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold">
                  {isCritical ? 'Alerta Crítica' : isWarning ? 'Aviso de Stock' : isSuccess ? 'Operación Exitosa' : 'Sistema'}
                </span>
                <span className="text-[10px] opacity-75 font-mono">{notif.timestamp}</span>
              </div>
              <p className="mt-0.5 leading-relaxed text-[11px] opacity-95">
                {notif.message}
              </p>
            </div>

            <button
              onClick={() => dismissNotification(notif.id)}
              className="shrink-0 p-0.5 text-current opacity-60 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
