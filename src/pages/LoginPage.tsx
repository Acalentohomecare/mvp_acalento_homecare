import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake } from "lucide-react";
import { Button, Card, Input } from "../components/ui";
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
    return (
      <div className="flex min-h-screen items-center justify-center text-body text-ink/50">
        Carregando…
      </div>
    );
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
    <div className="flex min-h-screen items-center justify-center px-6 py-14">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <HeartHandshake className="text-accent-ink" size={22} strokeWidth={1.75} />
          <span className="text-display font-semibold">Acalento Gestão</span>
        </div>

        <Card>
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
            {error && <p className="text-note text-status-cancelado">{error}</p>}
            <Button type="submit" variant="primary" block>
              Entrar
            </Button>
          </form>
        </Card>

        <div className="mt-4 text-center text-note text-ink/40">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-ink/70 underline">
            Criar cadastro
          </Link>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-body font-semibold text-ink">
            Contas de demonstração
          </p>
          <div className="flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => attempt(acc.email, "123456")}
                className="rounded-[10px] border border-linha bg-surface-raised px-3 py-2 text-left text-note text-ink/70 transition-colors hover:border-accent"
              >
                <span className="font-semibold text-ink">{acc.label}</span> — {acc.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
