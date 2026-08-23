import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Info } from "lucide-react";
import { Button, Card, Cracha, Input, Select, Textarea } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ACTIVITIES } from "../../constants/activities";
import {
  ATTENDANCE_TYPE_DURATION,
  ATTENDANCE_TYPE_FIXED_DURATION,
  ATTENDANCE_TYPE_LABEL,
  ATTENDANCE_TYPE_ORDER,
} from "../../constants/attendance";
import { CATEGORY_CLASS, CATEGORY_LABEL } from "../../constants/caregiver";
import {
  attendanceRequiredCategory,
  companyAttendances,
  createAttendance,
  todayISO,
} from "../../services/attendances";
import { companyPatients, createPatient, splitAddress } from "../../services/patients";
import { formatCurrency } from "../../utils/format";
import type { AttendanceType } from "../../types";

const NEW_PATIENT = "__new__";

/** Grupo de controles (botões/checkboxes) — fieldset/legend para leitores de tela. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1 block text-[11.5px] font-semibold text-ink/60">{label}</legend>
      {children}
    </fieldset>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-ink/75">
      <input type="checkbox" className="size-4 accent-accent" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export function NewAttendancePage() {
  const { session } = useSession();
  const { state, setState } = useAppState();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState("");
  const [type, setType] = useState<AttendanceType>("shift12");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("07:00");
  const [durationHours, setDurationHours] = useState("12");
  const [recurring, setRecurring] = useState(false);
  const [recurrenceDescription, setRecurrenceDescription] = useState("");
  const [activityIds, setActivityIds] = useState<string[]>([]);
  const [value, setValue] = useState("180");
  const [error, setError] = useState("");

  // Campos do paciente novo (cadastro inline — CLAUDE.md §19 "Selecionar/Cadastrar Paciente").
  const [pName, setPName] = useState("");
  const [pAge, setPAge] = useState("");
  const [pGuardian, setPGuardian] = useState("");
  const [pNotes, setPNotes] = useState("");
  const [pWalksAlone, setPWalksAlone] = useState(false);
  const [pOxygen, setPOxygen] = useState(false);
  const [pTube, setPTube] = useState(false);
  const [pPets, setPPets] = useState("nenhum");

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink/50">
        Carregando…
      </div>
    );
  }

  const company = state.companies.find((c) => c.id === session?.companyId);

  const patients = companyPatients(state, session?.companyId);
  const previous = companyAttendances(state, session?.companyId)
    .filter((a) => a.status !== "draft")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const isNewPatient = patientId === NEW_PATIENT;
  const selectedPatient = patients.find((p) => p.id === patientId);
  const category = attendanceRequiredCategory(activityIds);
  const fixedDuration = ATTENDANCE_TYPE_FIXED_DURATION[type];

  const chooseType = (next: AttendanceType) => {
    setError("");
    setType(next);
    setDurationHours(String(ATTENDANCE_TYPE_DURATION[next]));
  };

  const choosePatient = (id: string) => {
    setPatientId(id);
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      const { street: s, number: n } = splitAddress(patient.address);
      setNeighborhood(patient.neighborhood);
      setStreet(s);
      setNumber(n);
    } else {
      setNeighborhood("");
      setStreet("");
      setNumber("");
    }
  };

  const reuse = (attendanceId: string) => {
    const source = previous.find((a) => a.id === attendanceId);
    if (!source) return;
    setPatientId(source.patientId);
    setType(source.type);
    setNeighborhood(source.neighborhood);
    setStreet(source.street);
    setNumber(source.number);
    setStartTime(source.startTime);
    setDurationHours(String(source.durationHours));
    setRecurring(source.recurring);
    setRecurrenceDescription(source.recurrenceDescription ?? "");
    setActivityIds(source.activityIds);
    setValue(String(source.value));
  };

  const submit = (e: FormEvent, publish: boolean) => {
    e.preventDefault();

    if (!patientId) return setError("Escolha um paciente ou cadastre um novo.");
    if (isNewPatient && (!pName.trim() || !pAge)) return setError("Informe nome e idade do paciente.");
    if (!neighborhood.trim() || !street.trim()) return setError("Informe o endereço do atendimento.");
    if (!startDate || !startTime) return setError("Informe data e horário.");
    if (activityIds.length === 0) return setError("Marque pelo menos uma atividade.");
    if (!Number(value)) return setError("Informe o valor oferecido.");
    setError("");

    setState((current) => {
      let next = current;
      let finalPatientId = patientId;

      if (isNewPatient) {
        const created = createPatient(next, {
          companyId: company!.id,
          name: pName.trim(),
          age: Number(pAge) || 0,
          city: company?.city ?? "",
          neighborhood: neighborhood.trim(),
          address: `${street.trim()}, ${number.trim()}`,
          guardianName: pGuardian.trim() || undefined,
          notes: pNotes.trim() || undefined,
          walksAlone: pWalksAlone,
          usesOxygen: pOxygen,
          usesFeedingTube: pTube,
          petsAtHome: pPets.trim() || "nenhum",
        });
        next = created.nextState;
        finalPatientId = created.patient.id;
      }

      return createAttendance(
        next,
        {
          companyId: company!.id,
          patientId: finalPatientId,
          type,
          neighborhood: neighborhood.trim(),
          street: street.trim(),
          number: number.trim(),
          startDate,
          startTime,
          durationHours: Number(durationHours) || 1,
          recurring,
          recurrenceDescription: recurrenceDescription.trim() || undefined,
          activityIds,
          value: Number(value),
        },
        publish,
      ).nextState;
    });

    navigate(publish ? "/empresa" : "/empresa/atendimentos");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <Link
        to="/empresa"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-ink/50 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> Início
      </Link>

      <h1 className="mt-3 font-display text-[22px] font-semibold">Novo atendimento</h1>
      <p className="mt-1 text-[12.5px] text-ink/50">
        As atividades marcadas definem sozinhas o perfil profissional exigido.
      </p>

      {previous.length > 0 && (
        <Card className="mt-5">
          <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-ink/60">
            <Copy size={13} /> Reaproveitar atendimento anterior
          </div>
          <Select
            aria-label="Reaproveitar atendimento anterior"
            defaultValue=""
            onChange={(e) => reuse(e.target.value)}
          >
            <option value="">Começar do zero</option>
            {previous.map((a) => (
              <option key={a.id} value={a.id}>
                {patients.find((p) => p.id === a.patientId)?.name ?? "Paciente"} ·{" "}
                {ATTENDANCE_TYPE_LABEL[a.type]} · {formatCurrency(a.value)}
              </option>
            ))}
          </Select>
        </Card>
      )}

      {/* onChange no form limpa o erro assim que o usuário corrige qualquer campo. */}
      <form className="mt-5 flex flex-col gap-4" onChange={() => setError("")}>
        <Select label="Paciente" value={patientId} onChange={(e) => choosePatient(e.target.value)}>
          <option value="">Selecione o paciente</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.age} anos · {p.neighborhood}
            </option>
          ))}
          <option value={NEW_PATIENT}>+ Cadastrar novo paciente</option>
        </Select>

        {selectedPatient && (
          <Card className="flex items-start gap-2.5">
            <Info size={15} className="mt-0.5 shrink-0 text-ink/40" />
            <div className="text-[12px] text-ink/70">
              <p className="font-semibold text-ink">
                {selectedPatient.name}, {selectedPatient.age} anos
              </p>
              <p className="mt-1">
                {selectedPatient.walksAlone ? "Anda sozinho(a)" : "Mobilidade reduzida"}
                {selectedPatient.usesOxygen && " · usa oxigênio"}
                {selectedPatient.usesFeedingTube && " · usa sonda"}
                {` · animais em casa: ${selectedPatient.petsAtHome}`}
              </p>
              {selectedPatient.notes && <p className="mt-1 text-ink/55">{selectedPatient.notes}</p>}
            </div>
          </Card>
        )}

        {isNewPatient && (
          <Card className="flex flex-col gap-3">
            <p className="text-[11.5px] font-semibold text-ink/60">Dados do novo paciente</p>
            <Input label="Nome" value={pName} onChange={(e) => setPName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Idade"
                type="number"
                min={0}
                value={pAge}
                onChange={(e) => setPAge(e.target.value)}
              />
              <Input
                label="Responsável"
                value={pGuardian}
                onChange={(e) => setPGuardian(e.target.value)}
                placeholder="Filha, esposo…"
              />
            </div>
            <Input
              label="Animais na residência"
              value={pPets}
              onChange={(e) => setPPets(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <Check label="Anda sozinho(a)" checked={pWalksAlone} onChange={() => setPWalksAlone((v) => !v)} />
              <Check label="Usa oxigênio" checked={pOxygen} onChange={() => setPOxygen((v) => !v)} />
              <Check label="Usa sonda" checked={pTube} onChange={() => setPTube((v) => !v)} />
            </div>
            <Textarea
              label="Observações"
              rows={2}
              value={pNotes}
              onChange={(e) => setPNotes(e.target.value)}
            />
          </Card>
        )}

        <Field label="Tipo de atendimento">
          <div className="flex flex-wrap gap-1.5">
            {ATTENDANCE_TYPE_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => chooseType(t)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 ease-out ${
                  type === t
                    ? "bg-ink text-surface"
                    : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
                }`}
              >
                {ATTENDANCE_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          <Input label="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <Input label="Logradouro" value={street} onChange={(e) => setStreet(e.target.value)} />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Data"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Horário"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Duração (h)"
            type="number"
            min={1}
            value={durationHours}
            disabled={fixedDuration}
            onChange={(e) => setDurationHours(e.target.value)}
          />
        </div>

        <div>
          <Check
            label="Repete (não é atendimento único)"
            checked={recurring}
            onChange={() => setRecurring((v) => !v)}
          />
          {recurring && (
            <div className="mt-2">
              <Input
                value={recurrenceDescription}
                onChange={(e) => setRecurrenceDescription(e.target.value)}
                placeholder="Ex.: Seg/Qua/Sex às 15h por 30 dias"
              />
            </div>
          )}
        </div>

        <Field label="Atividades exigidas">
          <div className="flex flex-col gap-1.5">
            {ACTIVITIES.map((activity) => (
              <Check
                key={activity.id}
                label={activity.name}
                checked={activityIds.includes(activity.id)}
                onChange={() =>
                  setActivityIds((prev) =>
                    prev.includes(activity.id)
                      ? prev.filter((id) => id !== activity.id)
                      : [...prev, activity.id],
                  )
                }
              />
            ))}
          </div>
        </Field>

        <Card className="flex flex-wrap items-center gap-2.5">
          <span className="text-[12px] text-ink/60">Perfil necessário:</span>
          <Cracha label={CATEGORY_LABEL[category]} className={CATEGORY_CLASS[category]} />
          <span className="text-[11.5px] text-ink/50">
            {activityIds.length === 0
              ? "Marque as atividades para o sistema definir o perfil."
              : category === "informal"
                ? "Nenhuma atividade exige formação — cuidador informal pode atender."
                : `As atividades marcadas exigem formação de nível ${CATEGORY_LABEL[category].toLowerCase()}.`}
          </span>
        </Card>

        <Input
          label="Valor oferecido (R$)"
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {error && <p className="text-[12.5px] text-status-cancelado">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" onClick={(e) => submit(e, true)}>
            Publicar atendimento
          </Button>
          <Button type="button" variant="ghost" onClick={(e) => submit(e, false)}>
            Salvar rascunho
          </Button>
        </div>
      </form>
    </div>
  );
}
