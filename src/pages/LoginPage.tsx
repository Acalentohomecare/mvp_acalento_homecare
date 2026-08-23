import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Aviso, Button, Card, Input, Logo, TelaCarregando } from "../components/ui";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { login } from "../services/auth";

const DEMO_ACCOUNTS = [
  { label: "Empresa", email: "empresa@demo.com" },
  { label: "Cuidador", email: "cuidador@demo.com" },
];

export function LoginPage() {
  const { state } = useAppState();
  const { signIn } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  if (!state) {
    return <TelaCarregando alturaTotal />;
  }

  const attempt = (attemptEmail: string, attemptPassword: string) => {
    const result = login(state, attemptEmail, attemptPassword);
    if (!result) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    setError("");
    signIn({
      userId: result.user.id,
      role: result.user.role,
      companyId: result.user.companyId,
      caregiverId: result.user.caregiverId,
    });
    navigate("/");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    attempt(email, password);
  };

  return (
    /*
      A entrada é a única tela sem navegação: ganha um véu suave da cor da marca no topo para
      não ser um retângulo cinza vazio, e o card fica elevado sobre ele.
    */
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent-soft to-transparent"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo variant="stacked" align="center" size={76} />
        </div>

        <p className="prosa mx-auto mb-5 text-center text-note text-ink-muted">
          Gestão de plantões, cuidadores e horas para empresas de home care.
        </p>

        <Card className="p-5 shadow-raised">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <Aviso>{error}</Aviso>}
            <Button type="submit" variant="primary" block>
              Entrar
            </Button>
          </form>
        </Card>

        <div className="mt-4 text-center text-note text-ink-subtle">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-accent underline">
            Criar cadastro
          </Link>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-heading text-ink-muted">
            Contas de demonstração
          </p>
          <div className="flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => attempt(acc.email, "123456")}
                className="flex min-h-11 flex-col justify-center rounded-control border border-linha bg-surface-raised px-3 py-2 text-left shadow-card transition-colors duration-150 hover:border-accent/45 hover:bg-accent-soft/40"
              >
                {/* Rótulo em cima, endereço embaixo: dois papéis tipográficos em vez de uma
                    linha só costurada por travessão. */}
                <span className="text-note font-semibold text-ink">{acc.label}</span>
                <span className="text-meta text-ink-subtle">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
