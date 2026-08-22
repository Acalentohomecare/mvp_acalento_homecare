import { useState, type FormEvent, type ReactNode } from "react";
import { BadgeCheck, Camera } from "lucide-react";
import { Avatar, Button, Card, Cracha, Input, Textarea } from "../../components/ui";
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
import type { Shift, Weekday } from "../../types";

/** Grupo de controles (chips/checkboxes) — fieldset/legend para leitores de tela. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1 block text-[11.5px] font-semibold text-ink/60">{label}</legend>
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
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 ease-out ${
        active
          ? "bg-ink text-surface"
          : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
      }`}
    >
      {label}
    </button>
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
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">
        Carregando…
      </div>
    );
  }

  const needsCouncil = requiresCouncil(caregiver.category);

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
    <div className="mx-auto max-w-2xl px-6 py-7">
      <div>
        <div className="flex items-start gap-3.5">
          <Avatar name={caregiver.name} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[21px] leading-tight font-semibold">{caregiver.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Cracha
                label={CATEGORY_LABEL[caregiver.category]}
                className={CATEGORY_CLASS[caregiver.category]}
              />
              {isVerified(caregiver) && (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-cat-informal">
                  <BadgeCheck size={14} /> Verificado
                </span>
              )}
            </div>
          </div>
        </div>

        <Card className="mt-4 flex items-center gap-3">
          <Camera size={18} className="shrink-0 text-ink/40" />
          <p className="text-[11.5px] text-ink/50">
            A foto de perfil é simulada nesta demonstração — mostramos suas iniciais.
          </p>
        </Card>

        <p className="mt-4 text-[11.5px] text-ink/45">
          Categoria e CPF não podem ser alterados por aqui: mudar a categoria exige uma nova
          conferência do administrador.
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
            <p className="mt-1 text-[11px] text-ink/40">Separe por vírgula.</p>
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
                  <span className="text-[11px] text-ink/40">
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
                <p className="mt-1 text-[11px] text-ink/40">Separe por vírgula.</p>
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
                <label key={activity.id} className="flex items-center gap-2 text-[13px] text-ink/75">
                  <input
                    type="checkbox"
                    className="size-4 accent-accent"
                    checked={activityIds.includes(activity.id)}
                    onChange={() => setActivityIds((prev) => toggle(prev, activity.id))}
                  />
                  {activity.name}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-ink/40">
              A lista mostra apenas o que a categoria {CATEGORY_LABEL[caregiver.category]} autoriza.
            </p>
          </Field>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary">
              Salvar alterações
            </Button>
            {saved && <span className="text-[12.5px] text-cat-informal">Perfil atualizado.</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
