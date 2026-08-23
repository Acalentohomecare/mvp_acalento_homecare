import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { Button, Card, Input } from "../components/ui";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { registerCaregiver } from "../services/auth";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "../constants/caregiver";
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
  const [notice, setNotice] = useState("");

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body text-ink/50">
        Carregando…
      </div>
    );
  }

  const submitCaregiver = () => {
    const { user, nextState } = registerCaregiver(state, { name, email, password, category });
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
        <div className="mb-6 flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-linha"}`} />
          ))}
        </div>

        <Card>
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-note font-semibold text-ink/60">Você é...</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={accountType === "caregiver" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setAccountType("caregiver")}
                  >
                    Cuidador
                  </Button>
                  <Button
                    type="button"
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
                  <p className="mb-2 text-note font-semibold text-ink/60">Categoria</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_ORDER.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
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
              {notice && <p className="text-note text-ink/60">{notice}</p>}
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
              <Input label="CPF" placeholder="000.000.000-00" disabled />
              {category !== "informal" && (
                <Input label="Registro no conselho de classe" placeholder="Ex.: COREN 12345" disabled />
              )}
              <Button
                variant="primary"
                block
                disabled={!name || !email || !password}
                onClick={() => setStep(3)}
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-[14px] border border-linha p-4 text-center">
                <Camera size={24} className="mx-auto mb-2 text-ink/50" />
                <p className="text-note font-semibold">Enviar documento + selfie (simulado)</p>
                <p className="prosa mt-1 text-body text-ink/50">
                  Nesta demo, o envio de documentos é simulado — sem upload real.
                </p>
              </div>
              <p className="text-note text-ink/50">
                Ao continuar, você aceita os Termos de Uso e a Política de Privacidade (simulado).
              </p>
              <Button variant="primary" block onClick={submitCaregiver}>
                Enviar cadastro
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-4 text-center text-note text-ink/40">
          <Link to="/login" className="underline">
            Voltar à entrada
          </Link>
        </div>
      </div>
    </div>
  );
}
