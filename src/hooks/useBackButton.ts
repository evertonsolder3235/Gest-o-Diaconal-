import { useEffect, useRef } from 'react';

/**
 * Hook para registrar modais, drawers e painéis com a pilha de histórico do navegador.
 * Quando o botão de voltar do dispositivo (ou navegador) é acionado, o modal é fechado
 * sem fechar o aplicativo e mantendo o usuário na tela atual.
 */
export function useRegisterBackHandler(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isClosingFromBackRef = useRef(false);
  const modalIdRef = useRef<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Adiciona uma identificação única para esta entrada no histórico
    const modalId = 'modal_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    modalIdRef.current = modalId;

    window.history.pushState({ isModal: true, modalId }, '');

    const handlePopState = (e: PopStateEvent) => {
      // Se o novo estado do histórico corresponde ao ID deste modal,
      // significa que o histórico voltou para este modal (um submodal acima dele fechou).
      // Não devemos fechar este modal pai.
      if (e.state && e.state.modalId === modalIdRef.current) {
        return;
      }

      isClosingFromBackRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      // Se o modal foi fechado via botão da UI (ex: botão X ou Cancelar) e não pelo botão voltar,
      // removemos a entrada do modal no histórico se ainda for a atual.
      if (!isClosingFromBackRef.current) {
        if (window.history.state && window.history.state.modalId === modalIdRef.current) {
          window.history.back();
        }
      }
      isClosingFromBackRef.current = false;
    };
  }, [isOpen]);
}
