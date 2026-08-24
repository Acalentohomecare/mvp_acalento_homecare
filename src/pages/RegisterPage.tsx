import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { Button, Card, Input, Logo, TelaCarregando } from "../components/ui";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { registerCaregiver } from "../services/auth";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "../constants/caregiver";
import { formatCpf, isCpfComplete } from "../utils/format";
import type { CaregiverCategory } from "../types";

type AccountType = "caregiver" | "company";

export function RegisterPage() {
  const { state, setState } = useAppState();
  const { signIn } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>("caregiver");
  const [category, setCategory] = useState<CaregiverCategory>("informal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [council, setCouncil] = useState("");
  const [notice, setNotice] = useState("");

  // O conselho de classe só existe para técnico e superior (CLAUDE.md §9).
  const requiresCouncil = category !== "informal";
  const cpfInvalid = cpf.length > 0 && !isCpfComplete(cpf);
  const step2Complete =
    Boolean(name && email && password) && isCpfComplete(cpf) && (!requiresCouncil || council.trim().length > 0);

  if (!state) {
    return <TelaCarregando alturaTotal />;
  }

  const submitCaregiver = () => {
    const { user, nextState } = registerCaregiver(state, {
      name,
      email,
      password,
      category,
      cpf,
      councilRegistration: requiresCouncil ? council.trim() : undefined,
    });
    setState(nextState);
    signIn({ userId: user.id, role: "caregiver", caregiverId: user.caregiverId });
    navigate("/cuidador/aguardando-aprovacao");
  };

  const submitCompany = () => {
    setNotice(
      "Cadastro de empresa simulado — use a conta de demonstração (empresa@demo.com) para explorar o perfil de empresa.",
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-14">
      <div className="w-full max-w-sm">
        <h1 className="sr-only">Criar cadastro</h1>

        <div className="mb-6 flex justify-center">
          <Logo variant="stacked" align="center" size={58} />
        </div>

        <div className="mb-6 flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-linha"}`} />
          ))}
        </div>

        <Card>
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-note font-semibold text-ink-muted">Você é...</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    aria-pressed={accountType === "caregiver"}
                    variant={accountType === "caregiver" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setAccountType("caregiver")}
                  >
                    Cuidador
                  </Button>
                  <Button
                    type="button"
                    aria-pressed={accountType === "company"}
                    variant={accountType === "company" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setAccountType("company")}
                  >
                    Empresa
                  </Button>
                </div>
              </div>
              {accountType === "caregiver" && (
                <div>
                  <p className="mb-2 text-note font-semibold text-ink-muted">Categoria</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_ORDER.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        aria-pressed={category === cat}
                        variant={category === cat ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setCategory(cat)}
                      >
                        {CATEGORY_LABEL[cat]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <Button
                variant="primary"
                block
                onClick={() => (accountType === "company" ? submitCompany() : setStep(2))}
              >
                Continuar
              </Button>
              {notice && <p className="text-note text-ink-muted">{notice}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <Input
                label="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
              />
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="CPF"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                error={cpfInvalid ? "Informe os 11 dígitos do CPF." : undefined}
              />
              {requiresCouncil && (
                <Input
                  label="Registro no conselho de classe"
                  placeholder="Ex.: COREN 12345"
                  value={council}
                  onChange={(e) => setCouncil(e.target.value)}
                />
              )}
              <Button variant="primary" block disabled={!step2Complete} onClick={() => setStep(3)}>
                Continuar
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-card border border-linha p-4 text-center">
                <Camera size={24} className="mx-auto mb-2 text-ink-subtle" />
                <p className="text-note font-semibold">Enviar documento + selfie (simulado)</p>
                <p className="prosa mt-1 text-body text-ink-subtle">
                  Nesta demo, o envio de documentos é simulado — sem upload real.
                </p>
              </div>
              <p className="text-note text-ink-subtle">
                Ao continuar, você aceita os Termos de Uso e a Política de Privacidade (simulado).
              </p>
              <Button variant="primary" block onClick={submitCaregiver}>
                Enviar cadastro
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-4 text-center text-note">
          {/* Sozinho na linha, não dentro de frase: alvo cheio, não link de texto. */}
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-control px-3 text-ink-subtle underline transition-colors duration-150 ease-out hover:text-ink"
          >
            Voltar à entrada
          </Link>
        </div>
      </div>
    </div>
  );
}
