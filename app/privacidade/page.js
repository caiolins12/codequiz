import LegalPage, { LEGAL_CONTACT_EMAIL } from '../../src/codequiz/screens/legal/LegalPage';

export const metadata = {
  title: 'Política de Privacidade — Brain Versus Brain',
  description: 'Como o Brain Versus Brain (BVB Game) coleta, usa e protege os seus dados.'
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      intro="Esta política explica quais dados o Brain Versus Brain (BVB Game) coleta, para que eles são usados e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018)."
    >
      <section>
        <h2>1. Dados que coletamos</h2>
        <ul>
          <li>
            <strong>Da sua conta Google</strong>, quando você entra com o Google: nome, endereço de e-mail e foto de
            perfil. Não temos acesso à sua senha nem a outros dados da sua conta Google.
          </li>
          <li>
            <strong>Do seu perfil no jogo</strong>: o apelido que você escolhe e os itens de visual (moldura, fundo e
            emoji) que você compra ou equipa.
          </li>
          <li>
            <strong>Do seu progresso</strong>: nível, XP, moedas, resultados de quizzes, pontos e histórico de partidas
            PvP, conquistas do passe e posição no ranking.
          </li>
          <li>
            <strong>De uso técnico</strong>: indicação de que você está online e informações necessárias para manter a
            sessão aberta e o jogo funcionando no seu aparelho.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Para que usamos os dados</h2>
        <ul>
          <li>Identificar você e manter seu progresso salvo e sincronizado entre aparelhos.</li>
          <li>Montar partidas PvP, rankings e o placar das batalhas.</li>
          <li>Mostrar seu apelido, avatar e visual para outros jogadores nas partidas e no ranking.</li>
          <li>Proteger o jogo contra abusos e corrigir problemas.</li>
        </ul>
        <p>Não vendemos seus dados, não exibimos anúncios e não usamos ferramentas de rastreamento de terceiros.</p>
      </section>

      <section>
        <h2>3. O que outros jogadores veem</h2>
        <p>
          Seu <strong>apelido</strong>, seu <strong>avatar</strong> (foto ou emoji equipado), seu visual, nível e pontos
          aparecem para outros jogadores no ranking e nas partidas. Seu e-mail e seu nome completo não são mostrados para
          outros jogadores.
        </p>
      </section>

      <section>
        <h2>4. Onde os dados ficam</h2>
        <p>
          Os dados ficam no <strong>Supabase</strong> (banco de dados e login, servidores em São Paulo) e o site é
          hospedado na <strong>Vercel</strong>. O login usa o serviço de autenticação do <strong>Google</strong>. Esses
          serviços tratam os dados apenas para operar o jogo. Parte do seu progresso e das suas preferências também fica
          salva no armazenamento local do seu navegador.
        </p>
      </section>

      <section>
        <h2>5. Cookies e armazenamento local</h2>
        <p>
          Usamos cookies e o armazenamento local do navegador para manter sua sessão, lembrar suas preferências (som,
          música, emojis de batalha) e acelerar o carregamento. Você pode escolher apenas os essenciais no aviso de
          cookies. Apagar os dados do navegador encerra a sessão naquele aparelho.
        </p>
      </section>

      <section>
        <h2>6. Por quanto tempo guardamos</h2>
        <p>
          Guardamos seus dados enquanto sua conta existir. Quando você pede a exclusão, apagamos seu perfil, progresso e
          histórico em até 30 dias, mantendo apenas o que a lei exigir.
        </p>
      </section>

      <section>
        <h2>7. Seus direitos</h2>
        <p>Pela LGPD, você pode a qualquer momento:</p>
        <ul>
          <li>confirmar se tratamos seus dados e acessar uma cópia deles;</li>
          <li>corrigir dados incompletos ou desatualizados;</li>
          <li>pedir a exclusão da sua conta e dos seus dados;</li>
          <li>revogar o consentimento e deixar de usar o login com o Google.</li>
        </ul>
        <p>
          Para isso, escreva para <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> usando o e-mail da
          sua conta. Você também pode remover o acesso do jogo à sua conta Google em{' '}
          <a href="https://myaccount.google.com/connections" rel="noreferrer" target="_blank">myaccount.google.com</a>.
        </p>
      </section>

      <section>
        <h2>8. Crianças</h2>
        <p>
          O jogo é voltado para estudantes e pode ser usado por menores de idade com a autorização e o acompanhamento dos
          pais ou responsáveis. Coletamos apenas os dados necessários para o jogo funcionar.
        </p>
      </section>

      <section>
        <h2>9. Mudanças nesta política</h2>
        <p>
          Podemos atualizar esta política quando o jogo mudar. A data da última atualização fica no topo desta página e
          mudanças importantes serão avisadas no próprio jogo.
        </p>
      </section>
    </LegalPage>
  );
}
