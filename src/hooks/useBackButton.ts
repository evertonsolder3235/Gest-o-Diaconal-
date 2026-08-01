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

  useEffect(() => {
    if (!isOpen) return;

    // Adiciona uma entrada no histórico para o modal aberto
    window.history.pushState({ isModal: true, timestamp: Date.now() }, '');

    const handlePopState = () => {
      isClosingFromBackRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      // Se o modal foi fechado via botão da UI (ex: botão X ou Cancelar) e não pelo botão voltar,
      // removemos a entrada do modal no histórico para manter a pilha sincronizada.
      if (!isClosingFromBackRef.current) {
        if (window.history.state && window.history.state.isModal) {
          window.history.back();
        }
      }
      isClosingFromBackRef.current = false;
    };
  }, [isOpen]);
}
