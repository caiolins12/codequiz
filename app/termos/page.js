import LegalPage, { LEGAL_CONTACT_EMAIL } from '../../src/codequiz/screens/legal/LegalPage';

export const metadata = {
  title: 'Termos de Uso — Brain Versus Brain',
  description: 'Regras de uso do Brain Versus Brain (BVB Game).'
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      intro="Ao entrar e jogar o Brain Versus Brain (BVB Game) você concorda com estes termos. Se não concordar, não use o jogo."
    >
      <section>
        <h2>1. O que é o jogo</h2>
        <p>
          O Brain Versus Brain é um jogo gratuito de perguntas e respostas com trilhas de estudo, ranking, passe de
          evolução e batalhas PvP em tempo real (duelo, 2x2 e Um contra todos) contra outros jogadores e jogadores
          controlados pelo sistema.
        </p>
      </section>

      <section>
        <h2>2. Sua conta</h2>
        <ul>
          <li>O acesso é feito com uma conta Google. Você é responsável pelo uso da sua conta.</li>
          <li>Cada pessoa deve usar uma única conta e não pode usar a conta de outra pessoa.</li>
          <li>
            O apelido não pode ser ofensivo, discriminatório, enganoso ou se passar por outra pessoa. Apelidos que
            violem esta regra podem ser alterados ou bloqueados.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Conduta</h2>
        <p>Não é permitido:</p>
        <ul>
          <li>usar programas, automações ou falhas do sistema para ganhar pontos, moedas ou vitórias;</li>
          <li>atrapalhar partidas de propósito ou combinar resultados com outros jogadores;</li>
          <li>enviar conteúdo ofensivo ou assediar outros jogadores (inclusive com emojis de batalha);</li>
          <li>tentar acessar dados de outros jogadores ou partes restritas do sistema.</li>
        </ul>
        <p>
          Quem descumprir estas regras pode ter pontos e progresso ajustados, ser removido do ranking ou ter a conta
          suspensa.
        </p>
      </section>

      <section>
        <h2>4. Moedas, itens e progresso</h2>
        <p>
          Moedas, itens de visual, pontos PvP e níveis existem apenas dentro do jogo, não têm valor em dinheiro e não
          podem ser vendidos, trocados ou transferidos. Para manter o equilíbrio do jogo, regras de pontuação, preços e
          recompensas podem mudar, e temporadas de ranking podem ser reiniciadas.
        </p>
      </section>

      <section>
        <h2>5. Conteúdo das perguntas</h2>
        <p>
          As perguntas e explicações têm fins educativos e de entretenimento. Trabalhamos para que estejam corretas, mas
          podem conter erros, que corrigimos assim que identificados.
        </p>
      </section>

      <section>
        <h2>6. Disponibilidade</h2>
        <p>
          O jogo é oferecido como está. Ele pode ficar fora do ar, passar por manutenção ou mudar sem aviso, e não
          garantimos que estará sempre disponível ou livre de falhas.
        </p>
      </section>

      <section>
        <h2>7. Privacidade</h2>
        <p>
          O tratamento dos seus dados está descrito na <a href="/privacidade">Política de Privacidade</a>.
        </p>
      </section>

      <section>
        <h2>8. Encerramento</h2>
        <p>
          Você pode parar de jogar quando quiser e pedir a exclusão da sua conta pelo e-mail{' '}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. Podemos encerrar contas que violem estes
          termos.
        </p>
      </section>

      <section>
        <h2>9. Mudanças e contato</h2>
        <p>
          Estes termos podem ser atualizados; a data da última versão fica no topo da página. Dúvidas:{' '}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
