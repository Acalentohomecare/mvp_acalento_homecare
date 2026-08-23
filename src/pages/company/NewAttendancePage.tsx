import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Info } from "lucide-react";
import { Aviso, Button, Card, Check, Chip, Cracha, Input, Select, TelaCarregando, Textarea, VoltarLink } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { useToast } from "../../hooks/useToast";
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
import { MOBILE_ACTION_BAR, MOBILE_ACTION_SPACER, PAGE_WORK } from "../../components/layout/page";

const NEW_PATIENT = "__new__";

/** Grupo de controles (botões/checkboxes) — fieldset/legend para leitores de tela. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1 block text-label text-ink-muted">{label}</legend>
      {children}
    </fieldset>
  );
}

/** Linha do resumo lateral: termo à esquerda, valor à direita. */
function Resumo({ termo, children }: { termo: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ink-subtle">{termo}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

export function NewAttendancePage() {
  const { session } = useSession();
  const { state, setState } = useAppState();
  const navigate = useNavigate();
  const { avisar } = useToast();

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
    return <TelaCarregando />;
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

    // A ação leva para outra tela: sem o aviso, quem publica não vê confirmação nenhuma do que
    // acabou de fazer (DESIGN_SYSTEM.md, seção 8.4).
    avisar(
      publish
        ? "Atendimento publicado. Já aparece para os cuidadores compatíveis."
        : "Rascunho salvo.",
    );
    navigate(publish ? "/empresa" : "/empresa/atendimentos");
  };

  return (
    <div className={PAGE_WORK}>
      <VoltarLink to="/empresa">Início</VoltarLink>

      <h1 className="mt-3 text-display">Novo atendimento</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">
        As atividades marcadas definem sozinhas o perfil profissional exigido.
      </p>

      {/*
        No desktop o formulário ganha um resumo ao lado. Não é o formulário partido em duas
        colunas — isso quebraria o caminho de preenchimento; é conteúdo derivado, que só existe
        aqui: o que vai ser publicado, e principalmente o **perfil exigido**, que muda enquanto
        as atividades são marcadas. Numa apresentação, é a regra agindo à vista de quem assiste,
        sem ninguém precisar rolar a tela para mostrá-la.
      */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
      <div className="min-w-0">
      {previous.length > 0 && (
        <Card className="mt-5">
          <div className="mb-2 flex items-center gap-1.5 text-note font-semibold text-ink-muted">
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
            <Info size={15} className="mt-0.5 shrink-0 text-ink-subtle" />
            <div className="text-note text-ink-muted">
              <p className="font-semibold text-ink">
                {selectedPatient.name}, {selectedPatient.age} anos
              </p>
              <p className="mt-1">
                {selectedPatient.walksAlone ? "Anda sozinho(a)" : "Mobilidade reduzida"}
                {selectedPatient.usesOxygen && " · usa oxigênio"}
                {selectedPatient.usesFeedingTube && " · usa sonda"}
                {` · animais em casa: ${selectedPatient.petsAtHome}`}
              </p>
              {selectedPatient.notes && <p className="mt-1 text-ink-muted">{selectedPatient.notes}</p>}
            </div>
          </Card>
        )}

        {isNewPatient && (
          <Card className="flex flex-col gap-3">
            <p className="text-note font-semibold text-ink-muted">Dados do novo paciente</p>
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
              <Chip key={t} selecionado={type === t} onClick={() => chooseType(t)}>
                {ATTENDANCE_TYPE_LABEL[t]}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          <Input label="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <Input label="Logradouro" value={street} onChange={(e) => setStreet(e.target.value)} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          {/* Onze itens em coluna única viram rolagem à toa quando há largura de sobra. */}
          <div className="flex flex-col gap-1.5 lg:grid lg:grid-cols-2 lg:gap-x-6">
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

        <Card className="flex flex-wrap items-center gap-2.5 lg:hidden">
          <span className="text-note text-ink-muted">Perfil necessário:</span>
          <Cracha label={CATEGORY_LABEL[category]} className={CATEGORY_CLASS[category]} />
          <span className="text-note text-ink-subtle">
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

        {error && <Aviso>{error}</Aviso>}

        {/*
          Onze atividades acima destes botões: no celular, "Publicar" ficava a uma rolagem
          inteira de distância da última decisão tomada. A barra fixa encurta isso para um toque
          e ainda serve de âncora — a pessoa sabe onde a ação está sem procurar.
        */}
        <div className={`${MOBILE_ACTION_BAR} md:flex-wrap`}>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 md:flex-none"
            onClick={(e) => submit(e, true)}
          >
            Publicar atendimento
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            onClick={(e) => submit(e, false)}
          >
            Salvar rascunho
          </Button>
        </div>
        <div aria-hidden="true" className={MOBILE_ACTION_SPACER} />
      </form>
      </div>

      <aside className="mt-5 hidden lg:sticky lg:top-6 lg:block">
        <Card>
          <h2 className="text-heading text-ink">
            Resumo
          </h2>

          <dl className="mt-3 flex flex-col gap-2 text-note">
            <Resumo termo="Paciente">
              {isNewPatient ? pName.trim() || "Novo paciente" : (selectedPatient?.name ?? "—")}
            </Resumo>
            <Resumo termo="Tipo">{ATTENDANCE_TYPE_LABEL[type]}</Resumo>
            <Resumo termo="Quando">
              <span className="numero">
                {startDate ? startDate.split("-").reverse().join("/") : "—"} {startTime}
              </span>
            </Resumo>
            <Resumo termo="Duração">
              <span className="numero">{durationHours}h</span>
            </Resumo>
            <Resumo termo="Bairro">{neighborhood.trim() || "—"}</Resumo>
            <Resumo termo="Atividades">
              {activityIds.length === 0
                ? "nenhuma marcada"
                : `${activityIds.length} ${activityIds.length === 1 ? "marcada" : "marcadas"}`}
            </Resumo>
            <Resumo termo="Valor">
              <span className="numero">{Number(value) ? formatCurrency(Number(value)) : "—"}</span>
            </Resumo>
          </dl>

          {/* A regra agindo. É o que esta tela existe para mostrar, então fica destacada do resto
              do resumo por uma divisória, não por mais uma caixa. */}
          <div className="mt-3.5 border-t border-linha pt-3.5">
            <p className="text-heading text-ink">
              Perfil necessário
            </p>
            <div className="mt-2">
              <Cracha label={CATEGORY_LABEL[category]} className={CATEGORY_CLASS[category]} />
            </div>
            <p className="mt-2 text-note text-ink-muted">
              {activityIds.length === 0
                ? "Marque as atividades para o sistema definir o perfil."
                : category === "informal"
                  ? "Nenhuma atividade exige formação — cuidador informal pode atender."
                  : `As atividades marcadas exigem formação de nível ${CATEGORY_LABEL[category].toLowerCase()}.`}
            </p>
          </div>
        </Card>
      </aside>
      </div>
    </div>
  );
}
