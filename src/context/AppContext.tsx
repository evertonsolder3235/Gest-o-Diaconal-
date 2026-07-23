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
  
  // Aniversariantes
  aniversariantes: Aniversariante[];
  addAniversariante: (data: Omit<Aniversariante, 'id'>) => void;
  updateAniversariante: (id: string, data: Partial<Aniversariante>) => void;
  deleteAniversariante: (id: string) => void;
  
  // Obreiros
  obreiros: Obreiro[];
  addObreiro: (data: Omit<Obreiro, 'id'>) => void;
  updateObreiro: (id: string, data: Partial<Obreiro>) => void;
  deleteObreiro: (id: string) => void;
  
  // Pedidos de Oração
  pedidos: PedidoOracao[];
  addPedido: (data: Omit<PedidoOracao, 'id'>) => void;
  updatePedido: (id: string, data: Partial<PedidoOracao>) => void;
  deletePedido: (id: string) => void;
  
  // Avisos
  avisos: Aviso[];
  addAviso: (data: Omit<Aviso, 'id'>) => void;
  updateAviso: (id: string, data: Partial<Aviso>) => void;
  deleteAviso: (id: string) => void;
  toggleFixarAviso: (id: string) => void;
  
  // Financeiro
  contribuicoes: ContribuicaoFinanceira[];
  addContribuicao: (data: Omit<ContribuicaoFinanceira, 'id'>) => void;
  updateContribuicao: (id: string, data: Partial<ContribuicaoFinanceira>) => void;
  deleteContribuicao: (id: string) => void;

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
  // Load initial states from localStorage if available
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'user');
    return saved ? JSON.parse(saved) : initialUsers[0];
  });

  const [activeTab, setActiveTabState] = useState<ViewTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [config, setConfig] = useState<IgrejaConfig>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.nomeIgreja === 'Igreja Evangélica Central') {
        parsed.nomeIgreja = 'IGREJA ADBRAS SEDE';
      }
      return parsed;
    }
    return initialConfig;
  });

  const [visitantes, setVisitantes] = useState<Visitante[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'visitantes');
    return saved ? JSON.parse(saved) : initialVisitantes;
  });

  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'aniversariantes');
    return saved ? JSON.parse(saved) : initialAniversariantes;
  });

  const [obreiros, setObreiros] = useState<Obreiro[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'obreiros');
    return saved ? JSON.parse(saved) : initialObreiros;
  });

  const [pedidos, setPedidos] = useState<PedidoOracao[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'pedidos');
    return saved ? JSON.parse(saved) : initialPedidosOracao;
  });

  const [avisos, setAvisos] = useState<Aviso[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'avisos');
    return saved ? JSON.parse(saved) : initialAvisos;
  });

  const [contribuicoes, setContribuicoes] = useState<ContribuicaoFinanceira[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'contribuicoes');
    return saved ? JSON.parse(saved) : initialContribuicoes;
  });

  const [escalas, setEscalas] = useState<ItemEscala[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'escalas');
    if (!saved) return initialEscalas;
    try {
      const parsed: ItemEscala[] = JSON.parse(saved);
      const missing = initialEscalas.filter((init) => !parsed.some((p) => p.id === init.id));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return initialEscalas;
    }
  });

  const [unseenModules, setUnseenModules] = useState<UnseenModules>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'unseen_modules');
    return saved ? JSON.parse(saved) : {
      visitantes: true,
      aniversariantes: true,
      obreiros: true,
      pedidos: true,
      avisos: true,
      financeiro: true
    };
  });

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
    if (password === 'Admimadbras') {
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
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'visitantes', JSON.stringify(visitantes));
  }, [visitantes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'aniversariantes', JSON.stringify(aniversariantes));
  }, [aniversariantes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'obreiros', JSON.stringify(obreiros));
  }, [obreiros]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'avisos', JSON.stringify(avisos));
  }, [avisos]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'contribuicoes', JSON.stringify(contribuicoes));
  }, [contribuicoes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'escalas', JSON.stringify(escalas));
  }, [escalas]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'unseen_modules', JSON.stringify(unseenModules));
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
      setDeferredPrompt(e);
    };

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    checkStandalone();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('success', 'Aplicativo instalado com sucesso!');
        } else {
          showToast('info', 'Instalação cancelada.');
        }
        setDeferredPrompt(null);
      });
    } else {
      showToast('info', 'Para instalar no celular, use a opção "Adicionar à Tela Inicial" do navegador.');
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
        aniversariantes,
        addAniversariante,
        updateAniversariante,
        deleteAniversariante,
        obreiros,
        addObreiro,
        updateObreiro,
        deleteObreiro,
        pedidos,
        addPedido,
        updatePedido,
        deletePedido,
        avisos,
        addAviso,
        updateAviso,
        deleteAviso,
        toggleFixarAviso,
        contribuicoes,
        addContribuicao,
        updateContribuicao,
        deleteContribuicao,
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
