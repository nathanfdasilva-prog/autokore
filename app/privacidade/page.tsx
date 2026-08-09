export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 md:p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: agosto de 2026</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Quem somos</h2>
            <p>
              O AutoKore ("nós", "nosso", "o Sistema") é uma plataforma de gestão para oficinas mecânicas.
              O serviço está atualmente em fase inicial de operação, administrado diretamente pela pessoa
              responsável pelo desenvolvimento e operação do AutoKore. Caso uma pessoa jurídica própria seja
              formalizada no futuro, esta política será atualizada com os dados correspondentes. Esta
              Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos dados
              pessoais no uso do AutoKore, em conformidade com a Lei Geral de Proteção de Dados
              (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. Dois papéis diferentes: quem é responsável por qual dado</h2>
            <p className="mb-2">
              É importante entender que existem dois tipos de dados pessoais tratados no AutoKore, com
              responsabilidades diferentes:
            </p>
            <p className="mb-2">
              <strong>a) Dados de quem usa o AutoKore diretamente</strong> (dono da oficina, mecânicos
              cadastrados): nome, e-mail, senha (armazenada de forma criptografada), telefone. Para esses
              dados, o AutoKore é o <strong>Controlador</strong> — somos nós que decidimos como e por que
              coletamos essa informação, para viabilizar o funcionamento da sua conta.
            </p>
            <p>
              <strong>b) Dados dos clientes das oficinas</strong> (nome, WhatsApp, CPF, veículo, placa,
              histórico de serviços): esses dados são inseridos no sistema pela própria oficina, para gerenciar
              seu próprio negócio. Nesse caso, a <strong>oficina é a Controladora</strong> desses dados — é
              ela quem decide coletar e usar essas informações sobre seus clientes. O AutoKore atua como
              <strong> Operador</strong>: apenas armazenamos e processamos esses dados por conta da oficina,
              seguindo as instruções dela, com a mesma segurança técnica aplicada a todo o sistema.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. Quais dados coletamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dados de cadastro: nome, e-mail, senha, telefone da oficina</li>
              <li>Dados da oficina: nome, CNPJ (opcional), endereço, horário de funcionamento</li>
              <li>Dados inseridos pela oficina sobre seus próprios clientes: nome, WhatsApp, CPF (opcional), veículos e placas</li>
              <li>Dados de uso: ordens de serviço, agendamentos, movimentações de estoque, avaliações</li>
              <li>Dados técnicos: endereço IP, tipo de dispositivo, páginas visitadas (via Google Analytics e Meta Pixel)</li>
              <li>Dados de pagamento: processados diretamente pelo Asaas (processadora de pagamentos); o AutoKore não armazena número de cartão de crédito</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Para que usamos esses dados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Viabilizar o funcionamento da sua conta e do sistema de gestão da oficina</li>
              <li>Processar cobranças da assinatura, quando aplicável</li>
              <li>Enviar comunicações operacionais (confirmações, avisos de cobrança, suporte)</li>
              <li>Melhorar o produto com base em métricas de uso agregadas</li>
              <li>Cumprir obrigações legais ou responder a autoridades competentes, quando exigido</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Base legal para o tratamento</h2>
            <p>
              Tratamos dados com base em: (i) <strong>execução de contrato</strong> — para viabilizar o uso
              do sistema que você contratou; (ii) <strong>legítimo interesse</strong> — para melhorias de
              produto e segurança; (iii) <strong>cumprimento de obrigação legal</strong>, quando aplicável.
              Para dados de clientes das oficinas, cabe à própria oficina garantir que possui base legal
              adequada (geralmente execução de contrato de prestação de serviço automotivo) para coletar
              e inserir esses dados no sistema.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. Com quem compartilhamos dados</h2>
            <p className="mb-2">Não vendemos dados pessoais. Compartilhamos dados apenas com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Firebase / Google Cloud</strong> — infraestrutura de banco de dados e autenticação</li>
              <li><strong>Asaas</strong> — processamento de cobranças e pagamentos</li>
              <li><strong>Google Analytics e Meta Pixel</strong> — métricas de uso do site (dados anonimizados/agregados sempre que possível)</li>
              <li>Autoridades públicas, quando exigido por lei ou ordem judicial</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas para proteger os dados armazenados, incluindo: autenticação segura,
              regras de acesso restritas por oficina (cada oficina só acessa seus próprios dados), controle
              de permissões por função (administrador/mecânico), e conexão criptografada (HTTPS) em todo o
              sistema. Apesar dos esforços, nenhum sistema é 100% imune a incidentes — em caso de violação de
              dados que possa gerar risco relevante, notificaremos os usuários afetados e a Autoridade Nacional
              de Proteção de Dados (ANPD), conforme exigido em lei.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. Por quanto tempo guardamos os dados</h2>
            <p>
              Mantemos os dados enquanto sua conta estiver ativa. Após o cancelamento, os dados podem ser
              mantidos por período adicional para cumprimento de obrigações legais (fiscais, por exemplo),
              e depois excluídos ou anonimizados.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Seus direitos como titular de dados</h2>
            <p className="mb-2">Nos termos da LGPD, você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Solicitar portabilidade dos dados a outro fornecedor</li>
              <li>Revogar o consentimento, quando aplicável</li>
              <li>Solicitar exclusão dos dados tratados com base no consentimento</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail{' '}
              <strong>autokoreapp@gmail.com</strong>. Se você é cliente de uma oficina que usa o
              AutoKore (não o dono da conta), a solicitação deve ser feita diretamente à oficina, que é a
              Controladora responsável pelos seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">10. Cookies</h2>
            <p>
              Usamos cookies e tecnologias similares para autenticação, funcionamento do sistema e análise
              de uso (Google Analytics, Meta Pixel). Você pode gerenciar cookies nas configurações do seu
              navegador, embora isso possa afetar o funcionamento de partes do sistema.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">11. Alterações desta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Mudanças relevantes serão comunicadas por e-mail
              ou aviso dentro do sistema.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">12. Contato</h2>
            <p>
              Dúvidas sobre esta política ou sobre seus dados pessoais podem ser enviadas para{' '}
              <strong>autokoreapp@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}