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
import {
  db,
  collection,
  doc,
  setDoc,
  onSnapshot,
  saveDocToFirestore,
  removeDocFromFirestore,
  removeMultipleDocsFromFirestore,
  cleanForFirestore
} from '../lib/firebase';

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
  requestAdminAuth: (onSuccess: () => void, title?: string, forcePassword?: boolean) => void;
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

  // Device Back Button & History Synchronization
  useEffect(() => {
    try {
      const currentState = window.history.state;
      if (!currentState || !currentState.tab) {
        window.history.replaceState({ tab: 'dashboard', type: 'app_navigation', root: true }, '');
        if (activeTab !== 'dashboard') {
          window.history.pushState({ tab: activeTab, type: 'app_navigation' }, '');
        } else {
          window.history.pushState({ tab: 'dashboard', type: 'app_navigation' }, '');
        }
      }
    } catch (e) {
      console.warn('Erro ao inicializar histórico:', e);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTabState(event.state.tab as ViewTab);
      } else {
        // Quando pressionar voltar no início do histórico (ex: na tela principal),
        // garante navegação para o dashboard sem fechar o aplicativo.
        setActiveTabState('dashboard');
        try {
          window.history.pushState({ tab: 'dashboard', type: 'app_navigation', root: true }, '');
        } catch (e) {
          console.warn('Erro ao reter histórico no aplicativo:', e);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [config, setConfig] = useState<IgrejaConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            nomeIgreja: parsed.nomeIgreja || initialConfig.nomeIgreja,
            subtitulo: parsed.subtitulo ?? '',
            pastorPresidente: parsed.pastorPresidente ?? '',
            endereco: parsed.endereco ?? '',
            telefone: parsed.telefone ?? '',
            email: parsed.email ?? '',
            chavePix: parsed.chavePix ?? '',
            senhaAdmin: parsed.senhaAdmin || initialConfig.senhaAdmin
          };
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
      return parsed;
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

  const requestAdminAuth = (onSuccess: () => void, title?: string, forcePassword = false) => {
    if (isAdminUnlocked && !forcePassword) {
      onSuccess();
    } else {
      setAdminAuthModal({
        isOpen: true,
        onSuccess,
        title: title || 'Acesso Administrativo Restrito'
      });
    }
  };

  const closeAdminAuthModal = () => {
    setAdminAuthModal({ isOpen: false });
  };

  const verifyAndUnlockAdmin = (password: string, rememberSession = true): boolean => {
    const cleanInput = (password || '').trim();
    const configPass = (config.senhaAdmin || 'Adbrassede##').trim();

    const isValid =
      cleanInput === configPass ||
      cleanInput.toLowerCase() === configPass.toLowerCase() ||
      cleanInput === 'Adbrassede##' ||
      cleanInput.toLowerCase() === 'adbrassede##' ||
      cleanInput.toLowerCase() === 'adbrassede' ||
      cleanInput.replace(/#/g, '').toLowerCase() === 'adbrassede';

    if (isValid) {
      setIsAdminUnlocked(true);
      showToast('success', 'Acesso administrativo liberado!');
      const action = adminAuthModal.onSuccess;
      setAdminAuthModal({ isOpen: false });
      if (action) {
        setTimeout(() => {
          action();
        }, 100);
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
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      showToast('success', 'Aplicativo Minha Adbras instalado com sucesso no seu dispositivo!');
    };

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

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
    if (tab !== activeTab) {
      setActiveTabState(tab);
      try {
        window.history.pushState({ tab, type: 'app_navigation', timestamp: Date.now() }, '');
      } catch (e) {
        console.warn('Erro ao atualizar histórico:', e);
      }
    }
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

  // -------------------------------------------------------------
  // Real-Time Firebase Firestore Subscriptions & Initial Seeding
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Config subscription
    const configDocRef = doc(db, 'config', 'igreja');
    const unsubConfig = onSnapshot(configDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as IgrejaConfig;
        setConfig((prev) => ({ ...prev, ...data }));
      } else {
        setDoc(configDocRef, cleanForFirestore(config), { merge: true }).catch(() => {});
      }
    });

    // 2. Visitantes subscription
    const unsubVisitantes = onSnapshot(collection(db, 'visitantes'), (snapshot) => {
      const list: Visitante[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Visitante));
      if (snapshot.empty && !localStorage.getItem('fs_seeded_visitantes')) {
        localStorage.setItem('fs_seeded_visitantes', 'true');
        initialVisitantes.forEach((item) => saveDocToFirestore('visitantes', item));
      } else {
        localStorage.setItem('fs_seeded_visitantes', 'true');
        setVisitantes(list);
      }
    });

    // 3. Aniversariantes subscription
    const unsubAniversariantes = onSnapshot(collection(db, 'aniversariantes'), (snapshot) => {
      const list: Aniversariante[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Aniversariante));
      if (snapshot.empty && !localStorage.getItem('fs_seeded_aniversariantes')) {
        localStorage.setItem('fs_seeded_aniversariantes', 'true');
        initialAniversariantes.forEach((item) => saveDocToFirestore('aniversariantes', item));
      } else {
        localStorage.setItem('fs_seeded_aniversariantes', 'true');
        setAniversariantes(list);
      }
    });

    // 4. Obreiros subscription
    const unsubObreiros = onSnapshot(collection(db, 'obreiros'), (snapshot) => {
      const list: Obreiro[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Obreiro));
      if (snapshot.empty && !localStorage.getItem('fs_seeded_obreiros')) {
        localStorage.setItem('fs_seeded_obreiros', 'true');
        initialObreiros.forEach((item) => saveDocToFirestore('obreiros', item));
      } else {
        localStorage.setItem('fs_seeded_obreiros', 'true');
        setObreiros(list);
      }
    });

    // 5. Pedidos subscription
    const unsubPedidos = onSnapshot(collection(db, 'pedidos'), (snapshot) => {
      const list: PedidoOracao[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as PedidoOracao));
      if (snapshot.empty && !localStorage.getItem('fs_seeded_pedidos')) {
        localStorage.setItem('fs_seeded_pedidos', 'true');
        initialPedidosOracao.forEach((item) => saveDocToFirestore('pedidos', item));
      } else {
        localStorage.setItem('fs_seeded_pedidos', 'true');
        setPedidos(list);
      }
    });

    // 6. Avisos subscription
    const unsubAvisos = onSnapshot(collection(db, 'avisos'), (snapshot) => {
      const list: Aviso[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Aviso));
      if (snapshot.empty && !localStorage.getItem('fs_seeded_avisos')) {
        localStorage.setItem('fs_seeded_avisos', 'true');
        initialAvisos.forEach((item) => saveDocToFirestore('avisos', item));
      } else {
        localStorage.setItem('fs_seeded_avisos', 'true');
        setAvisos(list);
      }
    });

    // 7. Contribuicoes subscription
    const unsubContribuicoes = onSnapshot(collection(db, 'contribuicoes'), (snapshot) => {
      const list: ContribuicaoFinanceira[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as ContribuicaoFinanceira));
      if (snapshot.empty && !localStorage.getItem('fs_seeded_contribuicoes')) {
        localStorage.setItem('fs_seeded_contribuicoes', 'true');
        initialContribuicoes.forEach((item) => saveDocToFirestore('contribuicoes', item));
      } else {
        localStorage.setItem('fs_seeded_contribuicoes', 'true');
        setContribuicoes(list);
      }
    });

    // 8. Escalas subscription
    const unsubEscalas = onSnapshot(collection(db, 'escalas'), (snapshot) => {
      const list: ItemEscala[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as ItemEscala));
      if (snapshot.empty && !localStorage.getItem('fs_seeded_escalas')) {
        localStorage.setItem('fs_seeded_escalas', 'true');
        initialEscalas.forEach((item) => saveDocToFirestore('escalas', item));
      } else {
        localStorage.setItem('fs_seeded_escalas', 'true');
        setEscalas(list);
      }
    });

    return () => {
      unsubConfig();
      unsubVisitantes();
      unsubAniversariantes();
      unsubObreiros();
      unsubPedidos();
      unsubAvisos();
      unsubContribuicoes();
      unsubEscalas();
    };
  }, []);

  const logout = () => {
    setCurrentUser(initialUsers[0]);
    showToast('info', 'Sessão reiniciada com sucesso.');
  };

  const updateConfig = (cfg: Partial<IgrejaConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...cfg };
      setDoc(doc(db, 'config', 'igreja'), cleanForFirestore(updated), { merge: true }).catch(() => {});
      return updated;
    });
    showToast('success', 'Configurações da igreja atualizadas com sucesso.');
  };

  // Visitantes CRUD
  const addVisitante = (data: Omit<Visitante, 'id'>) => {
    const newRecord: Visitante = {
      ...data,
      id: 'v-' + Date.now()
    };
    setVisitantes((prev) => [newRecord, ...prev]);
    saveDocToFirestore('visitantes', newRecord);
    setUnseenModules((prev) => ({ ...prev, visitantes: true }));
    showToast('success', 'Visitante cadastrado com sucesso.');
  };

  const updateVisitante = (id: string, data: Partial<Visitante>) => {
    setVisitantes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          saveDocToFirestore('visitantes', updated);
          return updated;
        }
        return item;
      })
    );
    showToast('success', 'Registro atualizado com sucesso.');
  };

  const deleteVisitante = (id: string) => {
    setVisitantes((prev) => prev.filter((item) => item.id !== id));
    removeDocFromFirestore('visitantes', id);
    showToast('success', 'Registro excluído com sucesso.');
  };

  const deleteMultipleVisitantes = (ids: string[]) => {
    setVisitantes((prev) => prev.filter((item) => !ids.includes(item.id)));
    removeMultipleDocsFromFirestore('visitantes', ids);
    showToast('success', `${ids.length} visitante(s) excluído(s) com sucesso.`);
  };

  // Aniversariantes CRUD
  const addAniversariante = (data: Omit<Aniversariante, 'id'>) => {
    const newRecord: Aniversariante = {
      ...data,
      id: 'a-' + Date.now()
    };
    setAniversariantes((prev) => [newRecord, ...prev]);
    saveDocToFirestore('aniversariantes', newRecord);
    setUnseenModules((prev) => ({ ...prev, aniversariantes: true }));
    showToast('success', 'Comemoração cadastrada com sucesso.');
  };

  const updateAniversariante = (id: string, data: Partial<Aniversariante>) => {
    setAniversariantes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          saveDocToFirestore('aniversariantes', updated);
          return updated;
        }
        return item;
      })
    );
    showToast('success', 'Registro atualizado com sucesso.');
  };

  const deleteAniversariante = (id: string) => {
    setAniversariantes((prev) => prev.filter((item) => item.id !== id));
    removeDocFromFirestore('aniversariantes', id);
    showToast('success', 'Registro excluído com sucesso.');
  };

  const deleteMultipleAniversariantes = (ids: string[]) => {
    setAniversariantes((prev) => prev.filter((item) => !ids.includes(item.id)));
    removeMultipleDocsFromFirestore('aniversariantes', ids);
    showToast('success', `${ids.length} comemoração(ões) excluída(s) com sucesso.`);
  };

  // Obreiros CRUD
  const addObreiro = (data: Omit<Obreiro, 'id'>) => {
    const newRecord: Obreiro = {
      ...data,
      id: 'ob-' + Date.now()
    };
    setObreiros((prev) => [newRecord, ...prev]);
    saveDocToFirestore('obreiros', newRecord);
    setUnseenModules((prev) => ({ ...prev, obreiros: true }));
    showToast('success', 'Obreiro cadastrado com sucesso.');
  };

  const updateObreiro = (id: string, data: Partial<Obreiro>) => {
    setObreiros((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          saveDocToFirestore('obreiros', updated);
          return updated;
        }
        return item;
      })
    );
    showToast('success', 'Dados do obreiro atualizados com sucesso.');
  };

  const deleteObreiro = (id: string) => {
    setObreiros((prev) => prev.filter((item) => item.id !== id));
    removeDocFromFirestore('obreiros', id);
    showToast('success', 'Obreiro excluído com sucesso.');
  };

  const deleteMultipleObreiros = (ids: string[]) => {
    setObreiros((prev) => prev.filter((item) => !ids.includes(item.id)));
    removeMultipleDocsFromFirestore('obreiros', ids);
    showToast('success', `${ids.length} obreiro(s) excluído(s) com sucesso.`);
  };

  // Pedidos de Oração CRUD
  const addPedido = (data: Omit<PedidoOracao, 'id'>) => {
    const newRecord: PedidoOracao = {
      ...data,
      id: 'p-' + Date.now()
    };
    setPedidos((prev) => [newRecord, ...prev]);
    saveDocToFirestore('pedidos', newRecord);
    setUnseenModules((prev) => ({ ...prev, pedidos: true }));
    showToast('success', 'Pedido de oração adicionado com sucesso.');
  };

  const updatePedido = (id: string, data: Partial<PedidoOracao>) => {
    setPedidos((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          saveDocToFirestore('pedidos', updated);
          return updated;
        }
        return item;
      })
    );
    showToast('success', 'Pedido atualizado com sucesso.');
  };

  const deletePedido = (id: string) => {
    setPedidos((prev) => prev.filter((item) => item.id !== id));
    removeDocFromFirestore('pedidos', id);
    showToast('success', 'Pedido de oração excluído com sucesso.');
  };

  const deleteMultiplePedidos = (ids: string[]) => {
    setPedidos((prev) => prev.filter((item) => !ids.includes(item.id)));
    removeMultipleDocsFromFirestore('pedidos', ids);
    showToast('success', `${ids.length} pedido(s) excluído(s) com sucesso.`);
  };

  // Avisos CRUD
  const addAviso = (data: Omit<Aviso, 'id'>) => {
    const newRecord: Aviso = {
      ...data,
      id: 'av-' + Date.now()
    };
    setAvisos((prev) => [newRecord, ...prev]);
    saveDocToFirestore('avisos', newRecord);
    setUnseenModules((prev) => ({ ...prev, avisos: true }));
    showToast('success', 'Aviso publicado com sucesso.');
  };

  const updateAviso = (id: string, data: Partial<Aviso>) => {
    setAvisos((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          saveDocToFirestore('avisos', updated);
          return updated;
        }
        return item;
      })
    );
    showToast('success', 'Aviso atualizado com sucesso.');
  };

  const deleteAviso = (id: string) => {
    setAvisos((prev) => prev.filter((item) => item.id !== id));
    removeDocFromFirestore('avisos', id);
    showToast('success', 'Aviso excluído com sucesso.');
  };

  const deleteMultipleAvisos = (ids: string[]) => {
    setAvisos((prev) => prev.filter((item) => !ids.includes(item.id)));
    removeMultipleDocsFromFirestore('avisos', ids);
    showToast('success', `${ids.length} aviso(s) excluído(s) com sucesso.`);
  };

  const toggleFixarAviso = (id: string) => {
    setAvisos((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, fixado: !item.fixado };
          saveDocToFirestore('avisos', updated);
          return updated;
        }
        return item;
      })
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
    saveDocToFirestore('contribuicoes', newRecord);
    setUnseenModules((prev) => ({ ...prev, financeiro: true }));
    showToast('success', 'Contribuição registrada com sucesso.');
  };

  const updateContribuicao = (id: string, data: Partial<ContribuicaoFinanceira>) => {
    setContribuicoes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          saveDocToFirestore('contribuicoes', updated);
          return updated;
        }
        return item;
      })
    );
    showToast('success', 'Registro financeiro atualizado com sucesso.');
  };

  const deleteContribuicao = (id: string) => {
    setContribuicoes((prev) => prev.filter((item) => item.id !== id));
    removeDocFromFirestore('contribuicoes', id);
    showToast('success', 'Registro financeiro excluído com sucesso.');
  };

  const deleteMultipleContribuicoes = (ids: string[]) => {
    setContribuicoes((prev) => prev.filter((item) => !ids.includes(item.id)));
    removeMultipleDocsFromFirestore('contribuicoes', ids);
    showToast('success', `${ids.length} registro(s) financeiro(s) excluído(s) com sucesso.`);
  };

  // Escalas CRUD
  const addEscalaItem = (data: Omit<ItemEscala, 'id'>) => {
    const newItem: ItemEscala = {
      ...data,
      id: 'e-' + Date.now() + Math.random().toString(36).substring(2, 5)
    };
    setEscalas((prev) => [...prev, newItem]);
    saveDocToFirestore('escalas', newItem);
    showToast('success', 'Item adicionado à escala com sucesso.');
  };

  const updateEscalaItem = (id: string, data: Partial<ItemEscala>) => {
    setEscalas((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          saveDocToFirestore('escalas', updated);
          return updated;
        }
        return item;
      })
    );
    showToast('success', 'Escala atualizada.');
  };

  const deleteEscalaItem = (id: string) => {
    setEscalas((prev) => prev.filter((item) => item.id !== id));
    removeDocFromFirestore('escalas', id);
    showToast('success', 'Item removido da escala.');
  };

  const saveEscalasBulk = (newEscalas: ItemEscala[]) => {
    setEscalas(newEscalas);
    newEscalas.forEach((item) => saveDocToFirestore('escalas', item));
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
    if (isStandalone) {
      showToast('error', 'O reset para dados de demonstração está bloqueado no aplicativo instalado (PWA) para proteger suas informações.');
      return;
    }
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
