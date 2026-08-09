export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 md:p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: agosto de 2026</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta no AutoKore, você concorda com estes Termos de Uso e com nossa
              <a href="/privacidade" className="text-orange-500"> Política de Privacidade</a>. Se você não
              concordar, não utilize o sistema.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. O que é o AutoKore</h2>
            <p>
              O AutoKore é um sistema de gestão para oficinas mecânicas, oferecendo controle de ordens de
              serviço, agendamentos, estoque, clientes e faturamento. O serviço está atualmente em fase
              inicial de operação.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. Cadastro e responsabilidades do usuário</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Você deve fornecer informações verdadeiras no cadastro</li>
              <li>Você é responsável por manter sua senha em sigilo</li>
              <li>Você é responsável pelos dados que você (ou sua equipe) inserir no sistema sobre seus próprios clientes, incluindo garantir que possui base legal adequada para coletar e armazenar esses dados</li>
              <li>É proibido usar o sistema para fins ilícitos ou que violem direitos de terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. Teste gratuito e assinatura</h2>
            <p className="mb-2">
              Novas contas têm acesso completo por 14 dias, sem necessidade de cartão de crédito. Após esse
              período, o acesso completo requer assinatura do plano Profissional (R$97/mês, sujeito a
              alteração mediante aviso prévio).
            </p>
            <p>
              Você pode cancelar sua assinatura a qualquer momento diretamente pelo sistema, sem multa ou
              fidelidade. O cancelamento interrompe cobranças futuras; não há reembolso de período já pago,
              salvo disposição legal em contrário.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. Seus dados e os dados dos seus clientes</h2>
            <p>
              Ao inserir dados de seus clientes (nome, WhatsApp, CPF, veículo) no AutoKore, você declara que
              possui legitimidade e base legal para tratar esses dados (geralmente, a relação contratual de
              prestação de serviço automotivo com seu cliente), e que informará seus clientes sobre esse
              tratamento quando aplicável, conforme a LGPD. O AutoKore atua apenas como operador técnico
              desses dados, seguindo suas instruções enquanto oficina.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. Disponibilidade do sistema</h2>
            <p>
              Nos esforçamos para manter o AutoKore disponível continuamente, mas não garantimos operação
              ininterrupta. Manutenções programadas serão comunicadas quando possível.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. Limitação de responsabilidade</h2>
            <p>
              O AutoKore é uma ferramenta de gestão. Não nos responsabilizamos por decisões comerciais
              tomadas com base nos dados do sistema, nem por prejuízos indiretos decorrentes do uso ou
              indisponibilidade da plataforma, dentro dos limites permitidos por lei.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. Encerramento de conta</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento. Podemos suspender ou encerrar contas que
              violem estes termos, mediante aviso quando possível.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Alterações destes termos</h2>
            <p>
              Podemos atualizar estes termos periodicamente. Mudanças relevantes serão comunicadas por e-mail
              ou aviso no sistema.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">10. Contato</h2>
            <p>
              Dúvidas sobre estes termos: <strong>autokoreapp@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}