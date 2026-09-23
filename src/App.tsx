/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AppData, 
  Proyecto, 
  Entregable, 
  Certificado, 
  GastoActividad, 
  Empresa, 
  FiltrosState 
} from './types';
import { INITIAL_DATA } from './data/initialData';
import { computeProjectMetrics, CertificadoDocumento, normalizeDate } from './utils/calculations';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { FiltrosSection } from './components/FiltrosSection';

// View modules matching Base44 reference image
import { DashboardView } from './components/DashboardView';
import { EntregablesView } from './components/EntregablesView';
import { ProyeccionesView } from './components/ProyeccionesView';
import { CurvaSView } from './components/CurvaSView';
import { AlertasView } from './components/AlertasView';
import { ConciliacionView } from './components/ConciliacionView';
import { VencimientosView } from './components/VencimientosView';
import { CertificadosView } from './components/CertificadosView';
import { FechasCorteView } from './components/FechasCorteView';
import { GastosView } from './components/GastosView';
import { ImportarExportarView } from './components/ImportarExportarView';
import { AyudaView } from './components/AyudaView';
import { ModoCampoView } from './components/ModoCampoView';

// Modals
import { EntregableModal } from './components/EntregableModal';
import { CertificadoModal } from './components/CertificadoModal';
import { SyncModal } from './components/SyncModal';
import { CargaMasivaExcelModal } from './components/CargaMasivaExcelModal';

import { 
  LayoutDashboard,
  Layers, 
  TrendingUp, 
  LineChart, 
  AlertTriangle, 
  Scale, 
  CalendarClock, 
  Receipt, 
  CalendarDays, 
  DollarSign, 
  FileCode, 
  HelpCircle,
  ClipboardCheck
} from 'lucide-react';

const STORAGE_KEY = 'base44_engineering_project_data';

const INITIAL_FILTROS: FiltrosState = {
  empresa: '',
  idEntregable: '',
  descripcion: '',
  categoria: '',
  estado: '',
  conSaldoPendiente: false,
  vencidos: false,
  completamenteCertificados: false,
  fechaDesde: '',
  fechaHasta: '',
};

type ActiveTabType = 
  | 'dashboard'
  | 'modo_campo'
  | 'taging'
  | 'proyecciones'
  | 'curva_s'
  | 'alertas'
  | 'conciliacion'
  | 'vencimientos'
  | 'certificaciones'
  | 'fechas_corte'
  | 'gastos'
  | 'importar_exportar'
  | 'ayuda';

export default function App() {
  // Theme style: Blanco Formal vs Azules Futuristas
  const [themeStyle, setThemeStyle] = useState<'formal' | 'futurista'>(() => {
    try {
      const saved = localStorage.getItem('base44_theme_style');
      if (saved === 'futurista' || saved === 'formal') return saved;
    } catch {}
    return 'formal';
  });

  useEffect(() => {
    try {
      localStorage.setItem('base44_theme_style', themeStyle);
    } catch {}
    if (themeStyle === 'futurista') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeStyle]);

  // Undo history stack
  const [history, setHistory] = useState<AppData[]>([]);

  // Load data from localStorage or fallback to INITIAL_DATA
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.proyectos && parsed.proyectos.length > 0) {
          // Si la empresa principal aún tiene el nombre interno "Taging", actualizarla con la empresa cliente ("VEL")
          parsed.proyectos = parsed.proyectos.map((p: any) => {
            if (p.empresas && p.empresas.length > 0 && p.empresas[0].nombre === 'Taging') {
              p.empresas[0] = { ...p.empresas[0], nombre: 'VEL' };
            }
            return p;
          });
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading localStorage data:', err);
    }
    return INITIAL_DATA;
  });

  // State with history recording
  const updateAppData = useCallback((updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      setHistory((h) => [...h.slice(-15), prev]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const previous = prevHistory[prevHistory.length - 1];
      setAppData(previous);
      return prevHistory.slice(0, -1);
    });
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }, [appData]);

  // Active project
  const currentProject = useMemo(() => {
    const found = appData.proyectos.find((p) => p.id === appData.proyectoActual);
    return found || appData.proyectos[0] || INITIAL_DATA.proyectos[0];
  }, [appData]);

  // Project financial metrics (11 KPI cards)
  const metrics = useMemo(() => {
    return computeProjectMetrics(currentProject);
  }, [currentProject]);

  // Active View Tab - matches Base44 tabs (default to Dashboard)
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

  // Fechas de corte seleccionadas persistentes por proyecto
  const [selectedCutoffDates, setSelectedCutoffDates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('taging_selected_cutoff_dates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleSetCutoffDate = (newDate: string) => {
    setSelectedCutoffDates((prev) => {
      const next = { ...prev, [currentProject.id]: newDate };
      try {
        localStorage.setItem('taging_selected_cutoff_dates', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const currentCutoffDate = selectedCutoffDates[currentProject.id];

  // Filtros state
  const [filtros, setFiltros] = useState<FiltrosState>(INITIAL_FILTROS);

  // Modal States
  const [isEntregableModalOpen, setIsEntregableModalOpen] = useState(false);
  const [editingEntregable, setEditingEntregable] = useState<Entregable | null>(null);

  const [isCertificadoModalOpen, setIsCertificadoModalOpen] = useState(false);
  const [editingCertificadoInfo, setEditingCertificadoInfo] = useState<{
    certificado: Certificado;
    entregableId: string;
    hitoId: string;
  } | null>(null);
  const [editingCertificadoDocumento, setEditingCertificadoDocumento] = useState<CertificadoDocumento | null>(null);
  const [defaultHitoForCertificado, setDefaultHitoForCertificado] = useState<{
    entregableId: string;
    hitoId: string;
  } | null>(null);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncModalTab, setSyncModalTab] = useState<'json' | 'vercel'>('json');
  const [isCargaMasivaModalOpen, setIsCargaMasivaModalOpen] = useState(false);

  // Handlers for Project Selection & Creation
  const handleSelectProyecto = (projId: string) => {
    updateAppData((prev) => ({
      ...prev,
      proyectoActual: projId,
    }));
  };

  const handleAddProyecto = (nombre: string) => {
    const newId = `proj_${Date.now()}`;
    const newProj: Proyecto = {
      id: newId,
      nombre,
      empresas: [{ id: `emp_${Date.now()}`, nombre: 'Taging', color: 'blue' }],
      entregables: [],
      fechasCorte: { [`emp_${Date.now()}`]: [] },
      config: { tolerancia: 2 },
    };

    updateAppData((prev) => ({
      ...prev,
      proyectos: [...prev.proyectos, newProj],
      proyectoActual: newId,
    }));
  };

  const handleRenameProyecto = (id: string, nuevoNombre: string, nuevaEmpresa?: string) => {
    const cleanNombre = nuevoNombre.trim();
    const cleanEmpresa = nuevaEmpresa?.trim();
    if (!cleanNombre) return;
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((p) => {
        if (p.id !== id) return p;
        let updatedEmpresas = [...p.empresas];
        if (cleanEmpresa) {
          if (updatedEmpresas.length > 0) {
            updatedEmpresas[0] = { ...updatedEmpresas[0], nombre: cleanEmpresa };
          } else {
            updatedEmpresas = [{ id: `emp_${Date.now()}`, nombre: cleanEmpresa, color: 'blue' }];
          }
        }
        return {
          ...p,
          nombre: cleanNombre,
          empresas: updatedEmpresas,
        };
      }),
    }));
  };

  const handleUpdateEmpresas = (empresas: Empresa[]) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((p) =>
        p.id === currentProject.id ? { ...p, empresas } : p
      ),
    }));
  };

  // Deliverable Handlers
  const handleSaveEntregable = (savedEntregable: Entregable) => {
    updateAppData((prev) => {
      const updatedProyectos = prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const exists = proj.entregables.some((e) => e.id === savedEntregable.id);
        const newEntregables = exists
          ? proj.entregables.map((e) => (e.id === savedEntregable.id ? savedEntregable : e))
          : [...proj.entregables, savedEntregable];

        return {
          ...proj,
          entregables: newEntregables,
        };
      });

      return {
        ...prev,
        proyectos: updatedProyectos,
      };
    });
  };

  const handleDeleteEntregable = (id: string) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) =>
        proj.id === currentProject.id
          ? {
              ...proj,
              entregables: proj.entregables.filter((e) => e.id !== id),
            }
          : proj
      ),
    }));
  };

  const handleDuplicateEntregable = (entregable: Entregable) => {
    const duplicated: Entregable = {
      ...entregable,
      id: `ent_${Date.now()}`,
      codigo: `${entregable.codigo}-COPIA`,
      descripcion: `${entregable.descripcion} (Copia)`,
      hitos: entregable.hitos.map((h, idx) => ({
        ...h,
        id: `hito_${Date.now()}_${idx}`,
        certificados: [],
      })),
    };

    handleSaveEntregable(duplicated);
  };

  const handleToggleCurva = (entregableId: string) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        return {
          ...proj,
          entregables: proj.entregables.map((e) =>
            e.id === entregableId ? { ...e, incluirCurva: !e.incluirCurva } : e
          ),
        };
      }),
    }));
  };

  const handleBulkImportEntregables = (
    newOrUpdatedEntregables: Entregable[],
    mode: 'merge' | 'replace'
  ) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        if (mode === 'replace') {
          return {
            ...proj,
            entregables: newOrUpdatedEntregables,
          };
        }

        // Merge mode: map existing by code
        const mergedMap = new Map<string, Entregable>();
        proj.entregables.forEach((e) => mergedMap.set(e.codigo.toLowerCase().trim(), e));

        newOrUpdatedEntregables.forEach((incoming) => {
          const key = incoming.codigo.toLowerCase().trim();
          mergedMap.set(key, incoming);
        });

        return {
          ...proj,
          entregables: Array.from(mergedMap.values()),
        };
      }),
    }));
  };

  // Certificate Handlers
  const handleSaveCertificado = (
    entregableId: string,
    hitoId: string,
    certificado: Certificado,
    isEdit: boolean
  ) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const updatedEntregables = proj.entregables.map((ent) => {
          if (ent.id !== entregableId) return ent;

          const updatedHitos = ent.hitos.map((h) => {
            if (h.id !== hitoId) return h;

            const updatedCerts = isEdit
              ? h.certificados.map((c) => (c.id === certificado.id ? certificado : c))
              : [...h.certificados, certificado];

            return {
              ...h,
              certificados: updatedCerts,
            };
          });

          return {
            ...ent,
            hitos: updatedHitos,
          };
        });

        return {
          ...proj,
          entregables: updatedEntregables,
        };
      }),
    }));
  };

  const handleSaveMultiCertificado = (
    baseCertificado: Omit<Certificado, 'id' | 'importe'>,
    actividades: { entregableId: string; hitoId: string; importe: number }[]
  ) => {
    const groupId = `grp_${Date.now()}`;
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const actMap = new Map<string, number>();
        actividades.forEach((a) => actMap.set(`${a.entregableId}__${a.hitoId}`, a.importe));

        const updatedEntregables = proj.entregables.map((ent) => {
          let hasChanges = false;
          const updatedHitos = ent.hitos.map((h) => {
            const key = `${ent.id}__${h.id}`;
            if (actMap.has(key)) {
              const imp = actMap.get(key) || 0;
              if (imp > 0) {
                hasChanges = true;
                const newCert: Certificado = {
                  ...baseCertificado,
                  id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                  grupo: groupId,
                  importe: imp,
                };
                return {
                  ...h,
                  certificados: [...h.certificados, newCert],
                };
              }
            }
            return h;
          });

          return hasChanges ? { ...ent, hitos: updatedHitos } : ent;
        });

        return {
          ...proj,
          entregables: updatedEntregables,
        };
      }),
    }));
  };

  const handleDeleteCertificado = (entregableId: string, hitoId: string, certId: string) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const updatedEntregables = proj.entregables.map((ent) => {
          if (ent.id !== entregableId) return ent;

          const updatedHitos = ent.hitos.map((h) => {
            if (h.id !== hitoId) return h;
            return {
              ...h,
              certificados: h.certificados.filter((c) => c.id !== certId),
            };
          });

          return {
            ...ent,
            hitos: updatedHitos,
          };
        });

        return {
          ...proj,
          entregables: updatedEntregables,
        };
      }),
    }));
  };

  const handleDeleteCertificadoDocumento = (doc: { actividades: { entregableId: string; hitoId: string; certId: string }[] }) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const toDeleteKeys = new Set(
          doc.actividades.map((a) => `${a.entregableId}__${a.hitoId}__${a.certId}`)
        );

        const updatedEntregables = proj.entregables.map((ent) => {
          const updatedHitos = ent.hitos.map((h) => {
            const remainingCerts = h.certificados.filter(
              (c) => !toDeleteKeys.has(`${ent.id}__${h.id}__${c.id}`)
            );
            return {
              ...h,
              certificados: remainingCerts,
            };
          });

          return {
            ...ent,
            hitos: updatedHitos,
          };
        });

        return {
          ...proj,
          entregables: updatedEntregables,
        };
      }),
    }));
  };

  const handleUpdateCertificadoStatus = (
    entregableId: string,
    hitoId: string,
    certId: string,
    newStatus: string
  ) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const updatedEntregables = proj.entregables.map((ent) => {
          if (ent.id !== entregableId) return ent;

          const updatedHitos = ent.hitos.map((h) => {
            if (h.id !== hitoId) return h;
            return {
              ...h,
              certificados: h.certificados.map((c) =>
                c.id === certId ? { ...c, estado: newStatus } : c
              ),
            };
          });

          return {
            ...ent,
            hitos: updatedHitos,
          };
        });

        return {
          ...proj,
          entregables: updatedEntregables,
        };
      }),
    }));
  };

  // Cutoff Dates & General Expenses Handlers
  const handleUpdateFechasCorte = (empresaId: string, newFechas: string[]) => {
    // Sort chronologically ascending from earliest to latest
    const cleaned: string[] = newFechas.map((f) => normalizeDate(f)).filter((f): f is string => Boolean(f));
    const sorted: string[] = Array.from(new Set(cleaned)).sort(
      (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()
    );

    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        return {
          ...proj,
          fechasCorte: {
            ...proj.fechasCorte,
            [empresaId]: sorted,
          },
        };
      }),
    }));
  };

  const handleUpdateGastosActividad = (gastos: Record<string, GastoActividad[]>) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) =>
        proj.id === currentProject.id ? { ...proj, gastosActividad: gastos } : proj
      ),
    }));
  };

  const handleUpdateGastosGenerales = (empresaId: string, gastos: GastoActividad[]) => {
    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        return {
          ...proj,
          gastosActividad: {
            ...proj.gastosActividad,
            [empresaId]: gastos,
          },
        };
      }),
    }));
  };

  // Reset & Download JSON
  const handleResetData = () => {
    updateAppData(() => INITIAL_DATA);
  };

  const handleDownloadJSON = () => {
    const currentJson = JSON.stringify(appData, null, 2);
    const blob = new Blob([currentJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proyectos_base44_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.proyectos && Array.isArray(parsed.proyectos) && parsed.proyectos.length > 0) {
        updateAppData(() => parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Helper to open new certificate
  const handleOpenNewCert = (entregableId?: string, hitoId?: string) => {
    if (entregableId && hitoId) {
      setDefaultHitoForCertificado({ entregableId, hitoId });
    } else {
      setDefaultHitoForCertificado(null);
    }
    setEditingCertificadoInfo(null);
    setEditingCertificadoDocumento(null);
    setIsCertificadoModalOpen(true);
  };

  const handleOpenEditDocumento = (doc: CertificadoDocumento) => {
    setEditingCertificadoDocumento(doc);
    setEditingCertificadoInfo(null);
    setDefaultHitoForCertificado(null);
    setIsCertificadoModalOpen(true);
  };

  const handleSaveDocumento = (
    docKey: string,
    baseCertificado: Omit<Certificado, 'id' | 'importe'>,
    actividades: { entregableId: string; hitoId: string; importe: number; seleccionado: boolean; certId?: string }[]
  ) => {
    const finalBaseCert: Omit<Certificado, 'id' | 'importe'> = {
      ...baseCertificado,
      fechaCobro:
        baseCertificado.estado === 'Cobrado' && !baseCertificado.fechaCobro
          ? baseCertificado.fechaPresentacion || new Date().toISOString().split('T')[0]
          : baseCertificado.fechaCobro,
    };

    updateAppData((prev) => ({
      ...prev,
      proyectos: prev.proyectos.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const actMap = new Map<string, { importe: number; seleccionado: boolean; certId?: string }>();
        actividades.forEach((a) =>
          actMap.set(`${a.entregableId}__${a.hitoId}`, {
            importe: a.importe,
            seleccionado: a.seleccionado,
            certId: a.certId,
          })
        );

        const updatedEntregables = proj.entregables.map((ent) => {
          let hasChanges = false;
          const updatedHitos = ent.hitos.map((h) => {
            const key = `${ent.id}__${h.id}`;
            const actConfig = actMap.get(key);

            const hasExistingInDoc = h.certificados.some(
              (c) =>
                (actConfig?.certId && c.id === actConfig.certId) ||
                c.grupo === docKey ||
                c.id === docKey ||
                `${c.nombre}_${c.fechaCobro || c.fechaPresentacion}` === docKey
            );

            if (hasExistingInDoc) {
              hasChanges = true;
              if (!actConfig || !actConfig.seleccionado || actConfig.importe <= 0) {
                return {
                  ...h,
                  certificados: h.certificados.filter(
                    (c) =>
                      !(
                        (actConfig?.certId && c.id === actConfig.certId) ||
                        c.grupo === docKey ||
                        c.id === docKey ||
                        `${c.nombre}_${c.fechaCobro || c.fechaPresentacion}` === docKey
                      )
                  ),
                };
              } else {
                return {
                  ...h,
                  certificados: h.certificados.map((c) => {
                    if (
                      (actConfig?.certId && c.id === actConfig.certId) ||
                      c.grupo === docKey ||
                      c.id === docKey ||
                      `${c.nombre}_${c.fechaCobro || c.fechaPresentacion}` === docKey
                    ) {
                      return {
                        ...c,
                        ...finalBaseCert,
                        grupo: c.grupo || docKey,
                        importe: actConfig.importe,
                      };
                    }
                    return c;
                  }),
                };
              }
            } else if (actConfig && actConfig.seleccionado && actConfig.importe > 0) {
              hasChanges = true;
              const newCert: Certificado = {
                ...finalBaseCert,
                id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                grupo: docKey,
                importe: actConfig.importe,
              };
              return {
                ...h,
                certificados: [...h.certificados, newCert],
              };
            }

            return h;
          });

          return hasChanges ? { ...ent, hitos: updatedHitos } : ent;
        });

        return {
          ...proj,
          entregables: updatedEntregables,
        };
      }),
    }));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      themeStyle === 'futurista'
        ? 'dark bg-[#080E1A] text-slate-100 selection:bg-cyan-500 selection:text-black'
        : 'bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Top Header Bar */}
      <Header
        proyectos={appData.proyectos}
        proyectoActualId={currentProject.id}
        onSelectProyecto={handleSelectProyecto}
        onAddProyecto={handleAddProyecto}
        onRenameProyecto={handleRenameProyecto}
        onOpenNewCert={() => handleOpenNewCert()}
        onSaveData={() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        }}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onUpdateEmpresas={handleUpdateEmpresas}
        themeStyle={themeStyle}
        onToggleThemeStyle={setThemeStyle}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as ActiveTabType)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Tab Navigation matching Base44 Reference Image */}
        <div id="app-tabs-navigation" className="no-print bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-1.5 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              onClick={() => setActiveTab('dashboard')}
              id="tab-dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('modo_campo')}
              id="tab-modo-campo"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-colors ${
                activeTab === 'modo_campo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Modo Campo 👷</span>
            </button>

            <button
              onClick={() => setActiveTab('taging')}
              id="tab-taging"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'taging'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currentProject.empresas?.[0]?.nombre || 'Entregables'} ({currentProject.entregables.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('proyecciones')}
              id="tab-proyecciones"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'proyecciones'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Proyecciones</span>
            </button>

            <button
              onClick={() => setActiveTab('curva_s')}
              id="tab-curva-s"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'curva_s'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Curva S</span>
            </button>

            <button
              onClick={() => setActiveTab('alertas')}
              id="tab-alertas"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'alertas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alertas</span>
            </button>

            <button
              onClick={() => setActiveTab('conciliacion')}
              id="tab-conciliacion"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'conciliacion'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Conciliación</span>
            </button>

            <button
              onClick={() => setActiveTab('vencimientos')}
              id="tab-vencimientos"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'vencimientos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Vencimientos</span>
            </button>

            <button
              onClick={() => setActiveTab('certificaciones')}
              id="tab-certificaciones"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'certificaciones'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Certificaciones ({metrics.cantidadCertificados})</span>
            </button>

            <button
              onClick={() => setActiveTab('fechas_corte')}
              id="tab-fechas-corte"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'fechas_corte'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Fechas de corte</span>
            </button>

            <button
              onClick={() => setActiveTab('gastos')}
              id="tab-gastos"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'gastos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Gastos</span>
            </button>

            <button
              onClick={() => setActiveTab('importar_exportar')}
              id="tab-importar-exportar"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'importar_exportar'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Importar/Exportar</span>
            </button>

            <button
              onClick={() => setActiveTab('ayuda')}
              id="tab-ayuda"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'ayuda'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ayuda</span>
            </button>
          </div>
        </div>

        {/* Active Tab View Rendering */}
        <section aria-label="Módulo Activo">
          {activeTab === 'dashboard' && (
            <DashboardView
              proyecto={currentProject}
              selectedCutoffDateProp={currentCutoffDate}
              onCutoffDateChange={handleSetCutoffDate}
              onNavigateToTab={(tab) => setActiveTab(tab as ActiveTabType)}
              onOpenNewCert={(entId, hitoId) => handleOpenNewCert(entId, hitoId)}
            />
          )}

          {activeTab === 'modo_campo' && (
            <ModoCampoView
              proyecto={currentProject}
              onUpdateEntregable={handleSaveEntregable}
              onSaveData={() => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
              }}
              onSwitchToDesktopView={() => setActiveTab('dashboard')}
              onNavigateToTab={(tab) => setActiveTab(tab as ActiveTabType)}
            />
          )}

          {activeTab === 'taging' && (
            <div className="space-y-4">
              <FiltrosSection
                filtros={filtros}
                onChangeFiltros={setFiltros}
                onResetFiltros={() => setFiltros(INITIAL_FILTROS)}
                empresas={currentProject.empresas}
                categorias={Array.from(new Set(currentProject.entregables.map((e) => e.categoria).filter(Boolean)))}
              />
              <EntregablesView
                proyecto={currentProject}
                filtros={filtros}
                onAddEntregable={() => {
                  setEditingEntregable(null);
                  setIsEntregableModalOpen(true);
                }}
                onEditEntregable={(ent) => {
                  setEditingEntregable(ent);
                  setIsEntregableModalOpen(true);
                }}
                onDeleteEntregable={handleDeleteEntregable}
                onDuplicateEntregable={handleDuplicateEntregable}
                onToggleCurva={handleToggleCurva}
                onOpenAddCertificado={(entId, hitoId) => handleOpenNewCert(entId, hitoId)}
                onDeleteCertificado={handleDeleteCertificado}
                onOpenCargaMasiva={() => setIsCargaMasivaModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'proyecciones' && (
            <ProyeccionesView proyecto={currentProject} />
          )}

          {activeTab === 'curva_s' && (
            <CurvaSView 
              proyecto={currentProject} 
              selectedCutoffDateProp={currentCutoffDate}
              onCutoffDateChange={handleSetCutoffDate}
            />
          )}

          {activeTab === 'alertas' && (
            <AlertasView
              proyecto={currentProject}
              onOpenCertificadoModal={(entId, hitoId) => handleOpenNewCert(entId, hitoId)}
              onNavigateToEntregable={(codigo) => {
                setFiltros((prev) => ({ ...prev, idEntregable: codigo }));
                setActiveTab('taging');
              }}
            />
          )}

          {activeTab === 'conciliacion' && (
            <ConciliacionView proyecto={currentProject} />
          )}

          {activeTab === 'vencimientos' && (
            <VencimientosView
              proyecto={currentProject}
              onOpenCertificadoModal={(entId) => handleOpenNewCert(entId)}
            />
          )}

          {activeTab === 'certificaciones' && (
            <CertificadosView
              proyecto={currentProject}
              onOpenAddCertificado={() => handleOpenNewCert()}
              onEditCertificado={(item) => {
                setEditingCertificadoInfo(item);
                setEditingCertificadoDocumento(null);
                setIsCertificadoModalOpen(true);
              }}
              onEditCertificadoDocumento={handleOpenEditDocumento}
              onDeleteCertificado={handleDeleteCertificado}
              onDeleteCertificadoDocumento={handleDeleteCertificadoDocumento}
              onUpdateCertificadoStatus={handleUpdateCertificadoStatus}
            />
          )}

          {activeTab === 'fechas_corte' && (
            <FechasCorteView
              proyecto={currentProject}
              onUpdateFechasCorte={handleUpdateFechasCorte}
              onUpdateGastosGenerales={handleUpdateGastosGenerales}
            />
          )}

          {activeTab === 'gastos' && (
            <GastosView
              proyecto={currentProject}
              onUpdateGastos={handleUpdateGastosActividad}
            />
          )}

          {activeTab === 'importar_exportar' && (
            <ImportarExportarView
              appData={appData}
              onImportJSON={handleImportJSON}
              onDownloadJSON={handleDownloadJSON}
              onResetData={handleResetData}
              onOpenVercelGuide={() => {
                setSyncModalTab('vercel');
                setIsSyncModalOpen(true);
              }}
              onOpenCargaMasivaExcel={() => setIsCargaMasivaModalOpen(true)}
            />
          )}

          {activeTab === 'ayuda' && (
            <AyudaView
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onOpenCargaMasivaExcel={() => setIsCargaMasivaModalOpen(true)}
              onOpenSyncModal={() => {
                setSyncModalTab('json');
                setIsSyncModalOpen(true);
              }}
              onOpenVercelGuide={() => {
                setSyncModalTab('vercel');
                setIsSyncModalOpen(true);
              }}
            />
          )}
        </section>
      </main>

      {/* Modals */}
      <EntregableModal
        isOpen={isEntregableModalOpen}
        onClose={() => setIsEntregableModalOpen(false)}
        onSave={handleSaveEntregable}
        initialEntregable={editingEntregable}
        empresas={currentProject.empresas}
      />

      <CertificadoModal
        isOpen={isCertificadoModalOpen}
        onClose={() => setIsCertificadoModalOpen(false)}
        proyecto={currentProject}
        onSaveCertificado={handleSaveCertificado}
        onSaveMultiCertificado={handleSaveMultiCertificado}
        onSaveDocumento={handleSaveDocumento}
        initialCertificado={editingCertificadoInfo}
        initialDocumento={editingCertificadoDocumento}
        defaultHito={defaultHitoForCertificado}
      />

      <CargaMasivaExcelModal
        isOpen={isCargaMasivaModalOpen}
        onClose={() => setIsCargaMasivaModalOpen(false)}
        proyecto={currentProject}
        onApplyImport={handleBulkImportEntregables}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        appData={appData}
        onImportData={(data) => updateAppData(() => data)}
        onResetToDefault={() => updateAppData(() => INITIAL_DATA)}
        defaultTab={syncModalTab}
      />
    </div>
  );
}
