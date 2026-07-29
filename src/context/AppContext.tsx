import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Visitante,
  Aniversariante,
  Obreiro,
  PedidoOracao,
  Aviso,
  ContribuicaoFinanceira,
  IgrejaConfig,
  ViewTab,
  UnseenCategory,
  UnseenModules,
  ToastMessage,
  ItemEscala
} from '../types';
import {
  initialConfig,
  initialUsers,
  initialVisitantes,
  initialAniversariantes,
  initialObreiros,
  initialPedidosOracao,
  initialAvisos,
  initialContribuicoes,
  initialEscalas
} from '../data/initialData';

interface ConfirmDeleteState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export interface AdminAuthModalState {
  isOpen: boolean;
  onSuccess?: () => void;
  title?: string;
}

interface AppContextType {
  // Auth & Admin Protection
  currentUser: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  isAdminUnlocked: boolean;
  requestAdminAuth: (onSuccess: () => void, title?: string) => void;
  adminAuthModal: AdminAuthModalState;
  closeAdminAuthModal: () => void;
  verifyAndUnlockAdmin: (password: string, rememberSession?: boolean) => boolean;
  lockAdmin: () => void;
  
  // Navigation & Search
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Config
  config: IgrejaConfig;
  updateConfig: (cfg: Partial<IgrejaConfig>) => void;
  
  // Visitantes
  visitantes: Visitante[];
  addVisitante: (data: Omit<Visitante, 'id'>) => void;
  updateVisitante: (id: string, data: Partial<Visitante>) => void;
  deleteVisitante: (id: string) => void;
  deleteMultipleVisitantes: (ids: string[]) => void;
  
  // Aniversariantes
  aniversariantes: Aniversariante[];
  addAniversariante: (data: Omit<Aniversariante, 'id'>) => void;
  updateAniversariante: (id: string, data: Partial<Aniversariante>) => void;
  deleteAniversariante: (id: string) => void;
  deleteMultipleAniversariantes: (ids: string[]) => void;
  
  // Obreiros
  obreiros: Obreiro[];
  addObreiro: (data: Omit<Obreiro, 'id'>) => void;
  updateObreiro: (id: string, data: Partial<Obreiro>) => void;
  deleteObreiro: (id: string) => void;
  deleteMultipleObreiros: (ids: string[]) => void;
  
  // Pedidos de Oração
  pedidos: PedidoOracao[];
  addPedido: (data: Omit<PedidoOracao, 'id'>) => void;
  updatePedido: (id: string, data: Partial<PedidoOracao>) => void;
  deletePedido: (id: string) => void;
  deleteMultiplePedidos: (ids: string[]) => void;
  
  // Avisos
  avisos: Aviso[];
  addAviso: (data: Omit<Aviso, 'id'>) => void;
  updateAviso: (id: string, data: Partial<Aviso>) => void;
  deleteAviso: (id: string) => void;
  deleteMultipleAvisos: (ids: string[]) => void;
  toggleFixarAviso: (id: string) => void;
  
  // Financeiro
  contribuicoes: ContribuicaoFinanceira[];
  addContribuicao: (data: Omit<ContribuicaoFinanceira, 'id'>) => void;
  updateContribuicao: (id: string, data: Partial<ContribuicaoFinanceira>) => void;
  deleteContribuicao: (id: string) => void;
  deleteMultipleContribuicoes: (ids: string[]) => void;

  // Escalas
  escalas: ItemEscala[];
  addEscalaItem: (data: Omit<ItemEscala, 'id'>) => void;
  updateEscalaItem: (id: string, data: Partial<ItemEscala>) => void;
  deleteEscalaItem: (id: string) => void;
  saveEscalasBulk: (newEscalas: ItemEscala[]) => void;

  // Unseen / Pulse notifications
  unseenModules: UnseenModules;
  markAsSeen: (category: UnseenCategory | string) => void;
  markAllAsSeen: () => void;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
  removeToast: (id: string) => void;
  
  // Confirm modal
  confirmModal: ConfirmDeleteState | null;
  askConfirmDelete: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmModal: () => void;
  
  // Data Tools
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
  resetDemoData: () => void;
  
  // PWA
  deferredPrompt: any;
  installPWA: () => void;
  isStandalone: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'gestao_diaconal_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Safe helper to read from localStorage without crashing
  const safeLoadStorage = <T,>(keySuffix: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + keySuffix);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (e) {
      console.warn(`Erro ao carregar '${keySuffix}' do localStorage, usando dados padrão:`, e);
      return fallback;
    }
  };

  // Safe helper to write to localStorage without crashing if storage quota is exceeded
  const safeSaveStorage = (keySuffix: string, value: any) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + keySuffix, JSON.stringify(value));
    } catch (e) {
      console.warn(`Aviso ao salvar '${keySuffix}' no localStorage:`, e);
    }
  };

  // Load initial states safely from localStorage
  const [currentUser, setCurrentUser] = useState<User>(() => 
    safeLoadStorage<User>('user', initialUsers[0])
  );

  const [activeTab, setActiveTabState] = useState<ViewTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [config, setConfig] = useState<IgrejaConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.nomeIgreja === 'Igreja Evangélica Central') {
            parsed.nomeIgreja = 'IGREJA ADBRAS SEDE';
          }
          return { ...initialConfig, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar config:', e);
    }
    return initialConfig;
  });

  const [visitantes, setVisitantes] = useState<Visitante[]>(() =>
    safeLoadStorage<Visitante[]>('visitantes', initialVisitantes)
  );

  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>(() =>
    safeLoadStorage<Aniversariante[]>('aniversariantes', initialAniversariantes)
  );

  const [obreiros, setObreiros] = useState<Obreiro[]>(() =>
    safeLoadStorage<Obreiro[]>('obreiros', initialObreiros)
  );

  const [pedidos, setPedidos] = useState<PedidoOracao[]>(() =>
    safeLoadStorage<PedidoOracao[]>('pedidos', initialPedidosOracao)
  );

  const [avisos, setAvisos] = useState<Aviso[]>(() =>
    safeLoadStorage<Aviso[]>('avisos', initialAvisos)
  );

  const [contribuicoes, setContribuicoes] = useState<ContribuicaoFinanceira[]>(() =>
    safeLoadStorage<ContribuicaoFinanceira[]>('contribuicoes', initialContribuicoes)
  );

  const [escalas, setEscalas] = useState<ItemEscala[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'escalas');
      if (!saved) return initialEscalas;
      const parsed: ItemEscala[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return initialEscalas;
      const missing = initialEscalas.filter((init) => !parsed.some((p) => p.id === init.id));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return initialEscalas;
    }
  });

  const [unseenModules, setUnseenModules] = useState<UnseenModules>(() =>
    safeLoadStorage<UnseenModules>('unseen_modules', {
      visitantes: true,
      aniversariantes: true,
      obreiros: true,
      pedidos: true,
      avisos: true,
      financeiro: true
    })
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmDeleteState | null>(null);

  // Admin Protection State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminAuthModal, setAdminAuthModal] = useState<AdminAuthModalState>({ isOpen: false });

  const requestAdminAuth = (onSuccess: () => void, title?: string) => {
    if (isAdminUnlocked) {
      onSuccess();
    } else {
      setAdminAuthModal({
        isOpen: true,
        onSuccess,
        title
      });
    }
  };

  const closeAdminAuthModal = () => {
    setAdminAuthModal({ isOpen: false });
  };

  const verifyAndUnlockAdmin = (password: string, rememberSession = true): boolean => {
    if (password === 'Adbrassede##') {
      if (rememberSession) {
        setIsAdminUnlocked(true);
      }
      showToast('success', 'Acesso administrativo liberado!');
      const action = adminAuthModal.onSuccess;
      setAdminAuthModal({ isOpen: false });
      if (action) {
        action();
      }
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    showToast('info', 'Acesso administrativo bloqueado.');
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    if (currentUser) {
      safeSaveStorage('user', currentUser);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeSaveStorage('config', config);
  }, [config]);

  useEffect(() => {
    safeSaveStorage('visitantes', visitantes);
  }, [visitantes]);

  useEffect(() => {
    safeSaveStorage('aniversariantes', aniversariantes);
  }, [aniversariantes]);

  useEffect(() => {
    safeSaveStorage('obreiros', obreiros);
  }, [obreiros]);

  useEffect(() => {
    safeSaveStorage('pedidos', pedidos);
  }, [pedidos]);

  useEffect(() => {
    safeSaveStorage('avisos', avisos);
  }, [avisos]);

  useEffect(() => {
    safeSaveStorage('contribuicoes', contribuicoes);
  }, [contribuicoes]);

  useEffect(() => {
    safeSaveStorage('escalas', escalas);
  }, [escalas]);

  useEffect(() => {
    safeSaveStorage('unseen_modules', unseenModules);
  }, [unseenModules]);

  const markAsSeen = (category: UnseenCategory | string) => {
    setUnseenModules((prev) => {
      if (category in prev) {
        return { ...prev, [category]: false };
      }
      return prev;
    });
  };

  const markAllAsSeen = () => {
    setUnseenModules({
      visitantes: false,
      aniversariantes: false,
      obreiros: false,
      pedidos: false,
      avisos: false,
      financeiro: false
    });
  };

  // Handle PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      (window as any).deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      (window as any).deferredPWAInstallPrompt = null;
      showToast('success', 'Aplicativo instalado na tela inicial com sucesso!');
    };

    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    // Check if event was captured before React mounted
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    checkStandalone();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Helper Functions
  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, text }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const askConfirmDelete = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeConfirmModal();
      }
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const setActiveTab = (tab: ViewTab) => {
    setActiveTabState(tab);
    markAsSeen(tab);
    setSearchQuery(''); // Reset search on tab switch
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Handlers
  const login = (email: string): boolean => {
    const found = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      showToast('success', `Bem-vindo, ${found.nome}!`);
      return true;
    }
    // If custom email, login as Deacon
    const customUser: User = {
      id: 'u-' + Date.now(),
      nome: email.split('@')[0].toUpperCase(),
      email: email,
      cargo: 'Diácono Líder',
      departamento: 'Diaconia'
    };
    setCurrentUser(customUser);
    showToast('success', 'Acesso realizado com sucesso.');
    return true;
  };

  const logout = () => {
    setCurrentUser(initialUsers[0]);
    showToast('info', 'Sessão reiniciada com sucesso.');
  };

  const updateConfig = (cfg: Partial<IgrejaConfig>) => {
    setConfig((prev) => ({ ...prev, ...cfg }));
    showToast('success', 'Configurações da igreja atualizadas com sucesso.');
  };

  // Visitantes CRUD
  const addVisitante = (data: Omit<Visitante, 'id'>) => {
    const newRecord: Visitante = {
      ...data,
      id: 'v-' + Date.now()
    };
    setVisitantes((prev) => [newRecord, ...prev]);
    setUnseenModules((prev) => ({ ...prev, visitantes: true }));
    showToast('success', 'Visitante cadastrado com sucesso.');
  };

  const updateVisitante = (id: string, data: Partial<Visitante>) => {
    setVisitantes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    showToast('success', 'Registro atualizado com sucesso.');
  };

  const deleteVisitante = (id: string) => {
    setVisitantes((prev) => prev.filter((item) => item.id !== id));
    showToast('success', 'Registro excluído com sucesso.');
  };

  const deleteMultipleVisitantes = (ids: string[]) => {
    setVisitantes((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast('success', `${ids.length} visitante(s) excluído(s) com sucesso.`);
  };

  // Aniversariantes CRUD
  const addAniversariante = (data: Omit<Aniversariante, 'id'>) => {
    const newRecord: Aniversariante = {
      ...data,
      id: 'a-' + Date.now()
    };
    setAniversariantes((prev) => [newRecord, ...prev]);
    setUnseenModules((prev) => ({ ...prev, aniversariantes: true }));
    showToast('success', 'Comemoração cadastrada com sucesso.');
  };

  const updateAniversariante = (id: string, data: Partial<Aniversariante>) => {
    setAniversariantes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    showToast('success', 'Registro atualizado com sucesso.');
  };

  const deleteAniversariante = (id: string) => {
    setAniversariantes((prev) => prev.filter((item) => item.id !== id));
    showToast('success', 'Registro excluído com sucesso.');
  };

  const deleteMultipleAniversariantes = (ids: string[]) => {
    setAniversariantes((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast('success', `${ids.length} comemoração(ões) excluída(s) com sucesso.`);
  };

  // Obreiros CRUD
  const addObreiro = (data: Omit<Obreiro, 'id'>) => {
    const newRecord: Obreiro = {
      ...data,
      id: 'ob-' + Date.now()
    };
    setObreiros((prev) => [newRecord, ...prev]);
    setUnseenModules((prev) => ({ ...prev, obreiros: true }));
    showToast('success', 'Obreiro cadastrado com sucesso.');
  };

  const updateObreiro = (id: string, data: Partial<Obreiro>) => {
    setObreiros((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    showToast('success', 'Dados do obreiro atualizados com sucesso.');
  };

  const deleteObreiro = (id: string) => {
    setObreiros((prev) => prev.filter((item) => item.id !== id));
    showToast('success', 'Obreiro excluído com sucesso.');
  };

  const deleteMultipleObreiros = (ids: string[]) => {
    setObreiros((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast('success', `${ids.length} obreiro(s) excluído(s) com sucesso.`);
  };

  // Pedidos de Oração CRUD
  const addPedido = (data: Omit<PedidoOracao, 'id'>) => {
    const newRecord: PedidoOracao = {
      ...data,
      id: 'p-' + Date.now()
    };
    setPedidos((prev) => [newRecord, ...prev]);
    setUnseenModules((prev) => ({ ...prev, pedidos: true }));
    showToast('success', 'Pedido de oração adicionado com sucesso.');
  };

  const updatePedido = (id: string, data: Partial<PedidoOracao>) => {
    setPedidos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    showToast('success', 'Pedido atualizado com sucesso.');
  };

  const deletePedido = (id: string) => {
    setPedidos((prev) => prev.filter((item) => item.id !== id));
    showToast('success', 'Pedido de oração excluído com sucesso.');
  };

  const deleteMultiplePedidos = (ids: string[]) => {
    setPedidos((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast('success', `${ids.length} pedido(s) excluído(s) com sucesso.`);
  };

  // Avisos CRUD
  const addAviso = (data: Omit<Aviso, 'id'>) => {
    const newRecord: Aviso = {
      ...data,
      id: 'av-' + Date.now()
    };
    setAvisos((prev) => [newRecord, ...prev]);
    setUnseenModules((prev) => ({ ...prev, avisos: true }));
    showToast('success', 'Aviso publicado com sucesso.');
  };

  const updateAviso = (id: string, data: Partial<Aviso>) => {
    setAvisos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    showToast('success', 'Aviso atualizado com sucesso.');
  };

  const deleteAviso = (id: string) => {
    setAvisos((prev) => prev.filter((item) => item.id !== id));
    showToast('success', 'Aviso excluído com sucesso.');
  };

  const deleteMultipleAvisos = (ids: string[]) => {
    setAvisos((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast('success', `${ids.length} aviso(s) excluído(s) com sucesso.`);
  };

  const toggleFixarAviso = (id: string) => {
    setAvisos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, fixado: !item.fixado } : item))
    );
    showToast('info', 'Destaque do aviso alterado.');
  };

  // Financeiro CRUD
  const addContribuicao = (data: Omit<ContribuicaoFinanceira, 'id'>) => {
    const newRecord: ContribuicaoFinanceira = {
      ...data,
      id: 'f-' + Date.now()
    };
    setContribuicoes((prev) => [newRecord, ...prev]);
    setUnseenModules((prev) => ({ ...prev, financeiro: true }));
    showToast('success', 'Contribuição registrada com sucesso.');
  };

  const updateContribuicao = (id: string, data: Partial<ContribuicaoFinanceira>) => {
    setContribuicoes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    showToast('success', 'Registro financeiro atualizado com sucesso.');
  };

  const deleteContribuicao = (id: string) => {
    setContribuicoes((prev) => prev.filter((item) => item.id !== id));
    showToast('success', 'Registro financeiro excluído com sucesso.');
  };

  const deleteMultipleContribuicoes = (ids: string[]) => {
    setContribuicoes((prev) => prev.filter((item) => !ids.includes(item.id)));
    showToast('success', `${ids.length} registro(s) financeiro(s) excluído(s) com sucesso.`);
  };

  // Escalas CRUD
  const addEscalaItem = (data: Omit<ItemEscala, 'id'>) => {
    const newItem: ItemEscala = {
      ...data,
      id: 'e-' + Date.now() + Math.random().toString(36).substring(2, 5)
    };
    setEscalas((prev) => [...prev, newItem]);
    showToast('success', 'Item adicionado à escala com sucesso.');
  };

  const updateEscalaItem = (id: string, data: Partial<ItemEscala>) => {
    setEscalas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    showToast('success', 'Escala atualizada.');
  };

  const deleteEscalaItem = (id: string) => {
    setEscalas((prev) => prev.filter((item) => item.id !== id));
    showToast('success', 'Item removido da escala.');
  };

  const saveEscalasBulk = (newEscalas: ItemEscala[]) => {
    setEscalas(newEscalas);
    showToast('success', 'Escala de Lugares e Horários salva com sucesso!');
  };

  // Export / Backup JSON
  const exportBackup = () => {
    const data = {
      config,
      visitantes,
      aniversariantes,
      obreiros,
      pedidos,
      avisos,
      contribuicoes,
      exportDate: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gestao_diaconal_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('success', 'Backup exportado com sucesso!');
  };

  // Import Backup
  const importBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.config) setConfig(data.config);
      if (data.visitantes) setVisitantes(data.visitantes);
      if (data.aniversariantes) setAniversariantes(data.aniversariantes);
      if (data.obreiros) setObreiros(data.obreiros);
      if (data.pedidos) setPedidos(data.pedidos);
      if (data.avisos) setAvisos(data.avisos);
      if (data.contribuicoes) setContribuicoes(data.contribuicoes);

      showToast('success', 'Dados restaurados com sucesso!');
      return true;
    } catch (e) {
      showToast('error', 'Arquivo de backup inválido ou corrompido.');
      return false;
    }
  };

  const resetDemoData = () => {
    setConfig(initialConfig);
    setVisitantes(initialVisitantes);
    setAniversariantes(initialAniversariantes);
    setObreiros(initialObreiros);
    setPedidos(initialPedidosOracao);
    setAvisos(initialAvisos);
    setContribuicoes(initialContribuicoes);
    showToast('info', 'Dados originais restaurados com sucesso.');
  };

  const installPWA = () => {
    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('success', 'Aplicativo instalado com sucesso!');
          setIsStandalone(true);
        } else {
          showToast('info', 'Instalação cancelada.');
        }
        setDeferredPrompt(null);
        (window as any).deferredPWAInstallPrompt = null;
      });
    } else {
      showToast('info', 'Abra o menu do navegador (⋮) e toque em "Instalar Aplicativo" ou "Adicionar à Tela Inicial".');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        config,
        updateConfig,
        visitantes,
        addVisitante,
        updateVisitante,
        deleteVisitante,
        deleteMultipleVisitantes,
        aniversariantes,
        addAniversariante,
        updateAniversariante,
        deleteAniversariante,
        deleteMultipleAniversariantes,
        obreiros,
        addObreiro,
        updateObreiro,
        deleteObreiro,
        deleteMultipleObreiros,
        pedidos,
        addPedido,
        updatePedido,
        deletePedido,
        deleteMultiplePedidos,
        avisos,
        addAviso,
        updateAviso,
        deleteAviso,
        deleteMultipleAvisos,
        toggleFixarAviso,
        contribuicoes,
        addContribuicao,
        updateContribuicao,
        deleteContribuicao,
        deleteMultipleContribuicoes,
        escalas,
        addEscalaItem,
        updateEscalaItem,
        deleteEscalaItem,
        saveEscalasBulk,
        unseenModules,
        markAsSeen,
        markAllAsSeen,
        toasts,
        showToast,
        removeToast,
        confirmModal,
        askConfirmDelete,
        closeConfirmModal,
        isAdminUnlocked,
        requestAdminAuth,
        adminAuthModal,
        closeAdminAuthModal,
        verifyAndUnlockAdmin,
        lockAdmin,
        exportBackup,
        importBackup,
        resetDemoData,
        deferredPrompt,
        installPWA,
        isStandalone
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
