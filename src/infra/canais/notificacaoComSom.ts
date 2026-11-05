import type { Aviso, Notificador } from '../../aplicacao/portas';

/**
 * Canal de aviso: notificação do navegador com um toque de som.
 *
 * Este arquivo é a prova do Aberto/Fechado. Ele nasceu sozinho: nenhum arquivo existente
 * precisou mudar para o sistema ganhar mais um jeito de avisar o estudante.
 */
class NotificacaoComSom implements Notificador {
  notificar(aviso: Aviso): void {
    this.tocar();
    this.mostrar(aviso);
  }

  /** Bipe curto gerado na hora: não depende de arquivo de áudio nem de rede. */
  private tocar(): void {
    const audio = new AudioContext();
    const oscilador = audio.createOscillator();
    const volume = audio.createGain();
    oscilador.frequency.value = 880;
    volume.gain.setValueAtTime(0.0001, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.2, audio.currentTime + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35);
    oscilador.connect(volume).connect(audio.destination);
    oscilador.start();
    oscilador.stop(audio.currentTime + 0.35);
  }

  private mostrar(aviso: Aviso): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Cantinas do CESAR', { body: aviso.mensagem });
      return;
    }
    if ('Notification' in window && Notification.permission !== 'denied') {
      void Notification.requestPermission().then((resposta) => {
        if (resposta === 'granted') new Notification('Cantinas do CESAR', { body: aviso.mensagem });
        else this.naPagina(aviso);
      });
      return;
    }
    this.naPagina(aviso);
  }

  /**
   * Quando o navegador nega a notificação, o aviso ainda aparece — na própria página.
   * Um canal que some em silêncio por falta de permissão não serviria para nada.
   */
  private naPagina(aviso: Aviso): void {
    const faixa = document.createElement('div');
    faixa.setAttribute('role', 'status');
    faixa.textContent = aviso.mensagem;
    faixa.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:28px', 'transform:translateX(-50%)',
      'max-width:min(560px, calc(100vw - 32px))', 'background:#070606', 'color:#fff',
      'padding:14px 22px', 'border-radius:999px', 'box-shadow:0 10px 30px rgb(7 6 6 / 28%)',
      'z-index:50', 'font:1rem/1.4 inherit', 'text-align:center',
    ].join(';');
    document.body.append(faixa);
    window.setTimeout(() => faixa.remove(), 6000);
  }
}

export default (): Notificador => new NotificacaoComSom();
