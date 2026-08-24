import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Plus } from "lucide-react";
import {
  Aviso,
  Button,
  Check,
  Chip,
  Cracha,
  Dado,
  Input,
  ListaDeDados,
  Painel,
  Select,
  TelaCarregando,
  Textarea,
  VoltarLink,
} from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { useToast } from "../../hooks/useToast";
import { CATEGORY_CLASS, CATEGORY_LABEL, CATEGORY_ORDER } from "../../constants/caregiver";
import {
  ATTENDANCE_TYPE_DURATION,
  ATTENDANCE_TYPE_FIXED_DURATION,
  ATTENDANCE_TYPE_LABEL,
  ATTENDANCE_TYPE_ORDER,
} from "../../constants/attendance";
import { companyAttendances, createAttendance, todayISO } from "../../services/attendances";
import { allActivities, createCustomActivity } from "../../services/activities";
import { companyPatients, createPatient, splitAddress } from "../../services/patients";
import { formatCurrency } from "../../utils/format";
import { dataCompleta } from "../../utils/date";
import type { AttendanceType, CaregiverCategory } from "../../types";
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
  const [requiredCategory, setRequiredCategory] = useState<CaregiverCategory | "">("");
  const [value, setValue] = useState("180");
  const [error, setError] = useState("");

  // Atividade nova, além do catálogo (CLAUDE.md §23 pede "atividades", não um catálogo fechado).
  const [addingActivity, setAddingActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityCategory, setNewActivityCategory] = useState<CaregiverCategory>("informal");

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
  const activities = allActivities(state);
  const fixedDuration = ATTENDANCE_TYPE_FIXED_DURATION[type];

  const addCustomActivity = () => {
    const name = newActivityName.trim();
    if (!name) return;
    const { activity, nextState } = createCustomActivity(state, {
      name,
      minCategory: newActivityCategory,
    });
    setState(nextState);
    setActivityIds((prev) => [...prev, activity.id]);
    setNewActivityName("");
    setNewActivityCategory("informal");
    setAddingActivity(false);
  };

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
    setRequiredCategory(source.requiredCategory);
    setValue(String(source.value));
  };

  const submit = (e: FormEvent, publish: boolean) => {
    e.preventDefault();

    if (!patientId) return setError("Escolha um paciente ou cadastre um novo.");
    if (isNewPatient && (!pName.trim() || !pAge)) return setError("Informe nome e idade do paciente.");
    if (!neighborhood.trim() || !street.trim()) return setError("Informe o endereço do atendimento.");
    if (!startDate || !startTime) return setError("Informe data e horário.");
    if (!requiredCategory) return setError("Escolha o perfil necessário para o atendimento.");
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
          requiredCategory: requiredCategory as CaregiverCategory,
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
        Escolha o perfil necessário e as atividades que o cuidador vai realizar.
      </p>

      {/*
        No desktop o formulário ganha um resumo ao lado. Não é o formulário partido em duas
        colunas — isso quebraria o caminho de preenchimento; é conteúdo derivado, que só existe
        aqui: o que vai ser publicado, e principalmente o **perfil necessário**, a decisão que mais
        pesa no formulário — é ela que decide quem pode ser convidado. Numa apresentação, dá para
        acompanhar a escolha sem rolar a tela para mostrá-la.
      */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
      <div className="min-w-0">
      {/* Reaproveitar é um atalho, não uma etapa: perdeu a caixa e virou uma linha acima do
          formulário. Como card, ele parecia o primeiro campo a preencher. */}
      {previous.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-linha pb-4">
          <span className="inline-flex shrink-0 items-center gap-1.5 text-note text-ink-muted">
            <Copy size={13} aria-hidden="true" /> Reaproveitar anterior
          </span>
          <div className="min-w-56 flex-1">
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
          </div>
        </div>
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

        {/* A ficha do paciente escolhido é **contexto do campo acima**, não um bloco novo: por
            isso ela recua para a superfície rebaixada em vez de subir para um card branco. */}
        {selectedPatient && (
          <div className="-mt-1 rounded-card border border-linha bg-surface-sunken/60 px-3.5 py-3 text-note text-ink-muted">
            <p className="font-semibold text-ink">
              {selectedPatient.name}, <span className="numero">{selectedPatient.age}</span> anos
            </p>
            <p className="mt-1">
              {selectedPatient.walksAlone ? "Anda sozinho(a)" : "Mobilidade reduzida"}
              {selectedPatient.usesOxygen && " · usa oxigênio"}
              {selectedPatient.usesFeedingTube && " · usa sonda"}
              {` · animais em casa: ${selectedPatient.petsAtHome}`}
            </p>
            {selectedPatient.notes && <p className="prosa mt-1">{selectedPatient.notes}</p>}
          </div>
        )}

        {isNewPatient && (
          <Painel title="Dados do novo paciente" className="flex flex-col">
            <div className="flex flex-col gap-3">
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
            </div>
          </Painel>
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

        {/*
          Quem decide o perfil necessário é quem publica — não é mais calculado a partir das
          atividades marcadas. Por isso mora aqui, junto das outras decisões sobre o atendimento,
          e não como um resultado abaixo da lista de atividades.
        */}
        <Field label="Perfil necessário">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_ORDER.map((cat) => (
              <Chip
                key={cat}
                selecionado={requiredCategory === cat}
                onClick={() => setRequiredCategory(cat)}
              >
                {CATEGORY_LABEL[cat]}
              </Chip>
            ))}
          </div>
          <p className="mt-1.5 text-meta text-ink-subtle">
            Só cuidadores dessa categoria ou acima aparecem para convite ou candidatura.
          </p>
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

        <Field label="Atividades do atendimento">
          {/* Onze itens em coluna única viram rolagem à toa quando há largura de sobra. */}
          <div className="flex flex-col gap-1.5 lg:grid lg:grid-cols-2 lg:gap-x-6">
            {activities.map((activity) => (
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

          {/*
            O catálogo fixo não cobre tudo que uma empresa pode precisar pedir. A atividade nova
            entra com a categoria mínima que ela exige — sem isso, a regra central do produto (R2)
            não teria como saber que ela pede formação, e um cuidador informal poderia aparecer
            como compatível para algo que não devia.
          */}
          {addingActivity ? (
            <div className="mt-3 flex flex-col gap-3 rounded-card border border-linha bg-surface-sunken/60 p-3.5">
              <Input
                label="Nome da atividade"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="Ex.: Aplicação de insulina"
              />
              <Select
                label="Formação mínima exigida"
                value={newActivityCategory}
                onChange={(e) => setNewActivityCategory(e.target.value as CaregiverCategory)}
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABEL[cat]}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  disabled={!newActivityName.trim()}
                  onClick={addCustomActivity}
                >
                  Adicionar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingActivity(false);
                    setNewActivityName("");
                    setNewActivityCategory("informal");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-3"
              onClick={() => setAddingActivity(true)}
            >
              <Plus size={13} /> Adicionar atividade
            </Button>
          )}
        </Field>

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
        <Painel title="Resumo">
          <ListaDeDados>
            <Dado termo="Paciente">
              {isNewPatient ? pName.trim() || "Novo paciente" : (selectedPatient?.name ?? "—")}
            </Dado>
            <Dado termo="Tipo">{ATTENDANCE_TYPE_LABEL[type]}</Dado>
            <Dado termo="Quando">
              <span className="numero">
                {startDate ? dataCompleta(startDate) : "—"} {startTime}
              </span>
            </Dado>
            <Dado termo="Duração">
              <span className="numero">{durationHours}h</span>
            </Dado>
            <Dado termo="Bairro">{neighborhood.trim() || "—"}</Dado>
            <Dado termo="Atividades">
              {activityIds.length === 0 ? (
                <span className="text-ink-subtle">nenhuma marcada</span>
              ) : (
                <>
                  <span className="numero">{activityIds.length}</span>{" "}
                  {activityIds.length === 1 ? "marcada" : "marcadas"}
                </>
              )}
            </Dado>
            <Dado termo="Valor">
              <span className="numero">{Number(value) ? formatCurrency(Number(value)) : "—"}</span>
            </Dado>
          </ListaDeDados>

          {/* A decisão que mais pesa no formulário — quem pode ser convidado depende dela. Fica
              destacada do resto do resumo por uma divisória, não por mais uma caixa. */}
          <div className="mt-3.5 border-t border-linha pt-3.5">
            <p className="text-dado text-ink-subtle uppercase">Perfil necessário</p>
            <div className="mt-2">
              {requiredCategory ? (
                <Cracha
                  label={CATEGORY_LABEL[requiredCategory]}
                  className={CATEGORY_CLASS[requiredCategory]}
                />
              ) : (
                <span className="text-note text-ink-subtle">Não escolhido</span>
              )}
            </div>
            <p className="mt-2 text-meta text-ink-subtle">
              {requiredCategory
                ? "Só cuidadores dessa categoria ou acima aparecem para convite ou candidatura."
                : "Escolha o perfil necessário no formulário."}
            </p>
          </div>
        </Painel>
      </aside>
      </div>
    </div>
  );
}
