import { useState, type FormEvent, type ReactNode } from "react";
import { BadgeCheck, Camera } from "lucide-react";
import { Avatar, Button, Card, Check, Chip, Cracha, Input, TelaCarregando, Textarea } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  APPROVAL_STATUS_CLASS,
  APPROVAL_STATUS_LABEL,
  CATEGORY_CLASS,
  CATEGORY_LABEL,
  SHIFT_LABEL,
  SHIFT_ORDER,
  WEEKDAY_LABEL,
  WEEKDAY_ORDER,
} from "../../constants/caregiver";
import {
  allowedActivities,
  isVerified,
  requiresCouncil,
  updateCaregiverProfile,
} from "../../services/caregivers";
import { caregiverCompanies } from "../../services/roster";
import type { Shift, Weekday } from "../../types";
import { PAGE_FORM } from "../../components/layout/page";

/** Grupo de controles (chips/checkboxes) — fieldset/legend para leitores de tela. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1 block text-label text-ink-muted">{label}</legend>
      {children}
    </fieldset>
  );
}

function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    // Dias e turnos ficam vários acesos ao mesmo tempo: modo múltiplo, fundo suave (seção 9.3).
    <Chip selecionado={active} modo="multiplo" onClick={onClick}>
      {label}
    </Chip>
  );
}

function toList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CaregiverProfilePage() {
  const { session } = useSession();
  const { state, setState } = useAppState();
  const caregiver = state?.caregivers.find((c) => c.id === session?.caregiverId);

  const [bio, setBio] = useState(caregiver?.bio ?? "");
  const [experienceYears, setExperienceYears] = useState(String(caregiver?.experienceYears ?? 0));
  const [city, setCity] = useState(caregiver?.city ?? "");
  const [neighborhoods, setNeighborhoods] = useState((caregiver?.neighborhoods ?? []).join(", "));
  const [shiftRate, setShiftRate] = useState(String(caregiver?.shiftRate ?? 0));
  const [councilRegistration, setCouncilRegistration] = useState(caregiver?.councilRegistration ?? "");
  const [specialties, setSpecialties] = useState((caregiver?.specialties ?? []).join(", "));
  const [activityIds, setActivityIds] = useState<string[]>(caregiver?.activityIds ?? []);
  const [days, setDays] = useState<Weekday[]>(caregiver?.availability.days ?? []);
  const [shifts, setShifts] = useState<Shift[]>(caregiver?.availability.shifts ?? []);
  const [saved, setSaved] = useState(false);

  if (!state || !caregiver) {
    return <TelaCarregando alturaTotal />;
  }

  const needsCouncil = requiresCouncil(caregiver.category);
  const companies = caregiverCompanies(state, caregiver.id);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setState((s) =>
      updateCaregiverProfile(s, caregiver.id, {
        bio,
        experienceYears: Number(experienceYears) || 0,
        city,
        neighborhoods: toList(neighborhoods),
        shiftRate: Number(shiftRate) || 0,
        activityIds,
        availability: { days, shifts },
        councilRegistration,
        specialties: toList(specialties),
      }),
    );
    setSaved(true);
  };

  return (
    <div className={PAGE_FORM}>
      <div>
        <div className="flex items-start gap-3.5">
          <Avatar name={caregiver.name} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="text-display">{caregiver.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Cracha
                label={CATEGORY_LABEL[caregiver.category]}
                className={CATEGORY_CLASS[caregiver.category]}
              />
              {isVerified(caregiver) && (
                <span className="inline-flex items-center gap-1 text-note font-semibold text-cat-informal">
                  <BadgeCheck size={14} /> Verificado
                </span>
              )}
            </div>
          </div>
        </div>

        <Card className="mt-4 flex items-center gap-3">
          <Camera size={18} className="shrink-0 text-ink-subtle" />
          <p className="text-note text-ink-subtle">
            A foto de perfil é simulada nesta demonstração — mostramos suas iniciais.
          </p>
        </Card>

        <Card className="mt-3">
          <p className="text-body font-semibold text-ink">
            Empresas que aprovaram seu cadastro
          </p>
          {companies.length === 0 ? (
            <p className="mt-1.5 text-note text-ink-subtle">
              Nenhuma ainda — só recebe convites quem já foi aprovado no quadro de uma empresa.
            </p>
          ) : (
            <ul className="mt-1.5 flex flex-col gap-1">
              {companies.map((co) => (
                <li key={co.id} className="text-body text-ink-muted">
                  · {co.name}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <p className="mt-4 text-note text-ink-subtle">
          Categoria e CPF não podem ser alterados por aqui: mudar a categoria exige uma nova
          conferência das empresas que têm você no quadro.
        </p>

        {/* onChange no form cobre inputs/textarea/checkbox; os chips avisam por conta própria. */}
        <form
          onSubmit={handleSubmit}
          onChange={() => setSaved(false)}
          className="mt-5 flex flex-col gap-4"
        >
          <Textarea
            label="Apresentação"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Anos de experiência"
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
            <Input
              label="Valor por plantão (R$)"
              type="number"
              min={0}
              value={shiftRate}
              onChange={(e) => setShiftRate(e.target.value)}
            />
          </div>

          <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />

          <div>
            <Input
              label="Bairros atendidos"
              value={neighborhoods}
              onChange={(e) => setNeighborhoods(e.target.value)}
              placeholder="Centro, Vila Nova"
            />
            <p className="mt-1 text-meta text-ink-subtle">Separe por vírgula.</p>
          </div>

          {needsCouncil && (
            <>
              <div>
                <Input
                  label="Registro no conselho de classe"
                  value={councilRegistration}
                  onChange={(e) => setCouncilRegistration(e.target.value)}
                  placeholder="Ex.: COREN 12345"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {caregiver.councilRegistrationStatus && (
                    <Cracha
                      label={APPROVAL_STATUS_LABEL[caregiver.councilRegistrationStatus]}
                      className={APPROVAL_STATUS_CLASS[caregiver.councilRegistrationStatus]}
                    />
                  )}
                  <span className="text-meta text-ink-subtle">
                    Alterar o registro devolve o cadastro para conferência.
                  </span>
                </div>
              </div>

              <div>
                <Input
                  label="Especialidades"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Cuidados pós-cirúrgicos, Curativos complexos"
                />
                <p className="mt-1 text-meta text-ink-subtle">Separe por vírgula.</p>
              </div>
            </>
          )}

          <Field label="Dias disponíveis">
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_ORDER.map((d) => (
                <ChipToggle
                  key={d}
                  label={WEEKDAY_LABEL[d]}
                  active={days.includes(d)}
                  onClick={() => {
                    setSaved(false);
                    setDays((prev) => toggle(prev, d));
                  }}
                />
              ))}
            </div>
          </Field>

          <Field label="Turnos">
            <div className="flex flex-wrap gap-1.5">
              {SHIFT_ORDER.map((s) => (
                <ChipToggle
                  key={s}
                  label={SHIFT_LABEL[s]}
                  active={shifts.includes(s)}
                  onClick={() => {
                    setSaved(false);
                    setShifts((prev) => toggle(prev, s));
                  }}
                />
              ))}
            </div>
          </Field>

          <Field label="Atividades que realiza">
            <div className="flex flex-col gap-1.5">
              {allowedActivities(caregiver.category).map((activity) => (
                <Check
                  key={activity.id}
                  label={activity.name}
                  checked={activityIds.includes(activity.id)}
                  onChange={() => setActivityIds((prev) => toggle(prev, activity.id))}
                />
              ))}
            </div>
            <p className="mt-1.5 text-meta text-ink-subtle">
              A lista mostra apenas o que a categoria {CATEGORY_LABEL[caregiver.category]} autoriza.
            </p>
          </Field>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary">
              Salvar alterações
            </Button>
            {saved && <span className="text-note text-cat-informal">Perfil atualizado.</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
