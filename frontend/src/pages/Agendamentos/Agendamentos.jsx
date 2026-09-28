import { useEffect, useState } from "react"
import {
    CalendarDays,
    Plus,
    Search,
    Clock3,
    MapPin,
    UserRound,
    GraduationCap,
    X,
    Trash2
} from "lucide-react"

import api from "../../services/api"
import "./Agendamento.css"

const SALAS = [
    "Laboratório Seco",
    "Sala de Vídeo",
    "Sala de Leitura",
    "Sala de Informática",
    "Sala de Apoio",
    "Laboratório Úmido"
]

const AULAS = [
    { numero: 1, inicio: "07:30", fim: "08:20" },
    { numero: 2, inicio: "08:20", fim: "09:10" },
    { numero: 3, inicio: "09:30", fim: "10:20" },
    { numero: 4, inicio: "10:20", fim: "11:10" },
    { numero: 5, inicio: "11:10", fim: "12:00" },
    { numero: 6, inicio: "13:00", fim: "13:50" },
    { numero: 7, inicio: "13:50", fim: "14:40" },
    { numero: 8, inicio: "15:00", fim: "15:50" },
    { numero: 9, inicio: "15:50", fim: "16:40" }
]

function Agendamentos() {

    const [agendamentos, setAgendamentos] = useState([])
    const [professores, setProfessores] = useState([])
    const [turmas, setTurmas] = useState([])

    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState("")

    const [busca, setBusca] = useState("")
    const [dataFiltro, setDataFiltro] = useState("")
    const [salaFiltro, setSalaFiltro] = useState("")

    const [modalAberto, setModalAberto] = useState(false)

    const [professorSelecionado, setProfessorSelecionado] = useState("")
    const [turmaSelecionada, setTurmaSelecionada] = useState("")
    const [dataSelecionada, setDataSelecionada] = useState("")
    const [salaSelecionada, setSalaSelecionada] = useState("")
    const [aulaSelecionada, setAulaSelecionada] = useState("")
    const [observacao, setObservacao] = useState("")

    const [salvando, setSalvando] = useState(false)
async function excluirAgendamento(id) {
    const confirmar = window.confirm(
        "Tem certeza que deseja excluir este agendamento?"
    );

    if (!confirmar) {
        return;
    }

    try {
        await api.delete(`/agendamentos/${id}`);

        console.log("[AGENDAMENTOS] Agendamento excluído:", id);

        carregarDados();
    } catch (erro) {
        console.error("[AGENDAMENTOS] Erro ao excluir:", erro);

        alert(
            erro.response?.data?.mensagem ||
            "Não foi possível excluir o agendamento."
        );
    }
}


    // =====================================================
    // CARREGAR DADOS
    // =====================================================

    const carregarDados = async () => {

        try {

            setCarregando(true)
            setErro("")

            console.log("[Agendamentos] Carregando dados...")

            const [
                agendamentosResposta,
                professoresResposta,
                turmasResposta
            ] = await Promise.all([
                api.get("/agendamentos"),
                api.get("/professores"),
                api.get("/turmas")
            ])

            const agendamentosDados = agendamentosResposta.data
            const professoresDados = professoresResposta.data
            const turmasDados = turmasResposta.data

            const listaAgendamentos =
                agendamentosDados.agendamentos || []

            const listaProfessores =
                Array.isArray(professoresDados)
                    ? professoresDados
                    : professoresDados.professores || []

            const listaTurmas =
                Array.isArray(turmasDados)
                    ? turmasDados
                    : turmasDados.turmas || []

            setAgendamentos(listaAgendamentos)
            setProfessores(listaProfessores)
            setTurmas(listaTurmas)

            console.log(
                "[Agendamentos] Agendamentos:",
                listaAgendamentos.length
            )

        } catch (erro) {

            console.error(
                "[Agendamentos] Erro ao carregar:",
                erro
            )

            setErro(
                "Não foi possível carregar os agendamentos."
            )

        } finally {

            setCarregando(false)
        }
    }


    useEffect(() => {
        carregarDados()
    }, [])


    // =====================================================
    // CRIAR AGENDAMENTO
    // =====================================================

    const criarAgendamento = async (evento) => {

        evento.preventDefault()

        if (
            !professorSelecionado ||
            !turmaSelecionada ||
            !dataSelecionada ||
            !salaSelecionada ||
            !aulaSelecionada
        ) {

            setErro(
                "Preencha todos os campos obrigatórios."
            )

            return
        }

        try {

            setSalvando(true)
            setErro("")

            console.log(
                "[Agendamentos] Criando agendamento..."
            )

            await api.post("/agendamentos", {
                professor_id: Number(professorSelecionado),
                turma_id: Number(turmaSelecionada),
                data: dataSelecionada,
                sala: salaSelecionada,
                aula: Number(aulaSelecionada),
                observacao: observacao.trim() || null
            })

            console.log(
                "[Agendamentos] Agendamento criado."
            )

            fecharModal()

            await carregarDados()

        } catch (erro) {

            console.error(
                "[Agendamentos] Erro ao criar:",
                erro
            )

            setErro(
                erro.response?.data?.mensagem ||
                "Não foi possível criar o agendamento."
            )

        } finally {

            setSalvando(false)
        }
    }


    // =====================================================
    // FECHAR MODAL
    // =====================================================

    const fecharModal = () => {

        setModalAberto(false)

        setProfessorSelecionado("")
        setTurmaSelecionada("")
        setDataSelecionada("")
        setSalaSelecionada("")
        setAulaSelecionada("")
        setObservacao("")
    }


    // =====================================================
    // FILTRAGEM
    // =====================================================

    const agendamentosFiltrados =
        agendamentos.filter((agendamento) => {

            const textoBusca = busca.toLowerCase()

            const correspondeBusca =
                agendamento.professor
                    ?.toLowerCase()
                    .includes(textoBusca) ||

                agendamento.turma
                    ?.toLowerCase()
                    .includes(textoBusca) ||

                agendamento.sala
                    ?.toLowerCase()
                    .includes(textoBusca)

            const correspondeData =
                !dataFiltro ||
                String(agendamento.data).slice(0, 10) === dataFiltro

            const correspondeSala =
                !salaFiltro ||
                agendamento.sala === salaFiltro

            return (
                correspondeBusca &&
                correspondeData &&
                correspondeSala
            )
        })


    // =====================================================
    // FORMATAR DATA
    // =====================================================

    const formatarData = (data) => {

        if (!data) {
            return "-"
        }

        const partes = String(data)
            .slice(0, 10)
            .split("-")

        if (partes.length !== 3) {
            return data
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`
    }


    // =====================================================
    // NOME DA AULA
    // =====================================================

    const obterNomeAula = (numero) => {

        const aula = AULAS.find(
            (item) => item.numero === Number(numero)
        )

        if (!aula) {
            return "-"
        }

        return `${aula.numero}ª aula`
    }


    // =====================================================
    // HORÁRIO
    // =====================================================

    const obterHorarioAula = (numero) => {

        const aula = AULAS.find(
            (item) => item.numero === Number(numero)
        )

        if (!aula) {
            return "-"
        }

        return `${aula.inicio} - ${aula.fim}`
    }


    return (
        <div className="pagina-agendamentos">

            <header className="cabecalho-agendamentos">

                <div>
                    <div className="titulo-pagina">

                        <div className="icone-titulo">
                            <CalendarDays size={22} />
                        </div>

                        <div>
                            <h1>Agendamentos</h1>

                            <p>
                                Gerencie reservas de salas e laboratórios.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="botao-novo-agendamento"
                    onClick={() => {
                        setErro("")
                        setModalAberto(true)
                    }}
                >
                    <Plus size={18} />
                    Novo agendamento
                </button>

            </header>


            {/* =================================================
                FILTROS
            ================================================= */}

            <section className="filtros-agendamentos">

                <div className="campo-busca">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Buscar professor, turma ou sala..."
                        value={busca}
                        onChange={(evento) =>
                            setBusca(evento.target.value)
                        }
                    />

                </div>


                <div className="campo-filtro">

                    <CalendarDays size={17} />

                    <input
                        type="date"
                        value={dataFiltro}
                        onChange={(evento) =>
                            setDataFiltro(evento.target.value)
                        }
                    />

                </div>


                <div className="campo-filtro">

                    <MapPin size={17} />

                    <select
                        value={salaFiltro}
                        onChange={(evento) =>
                            setSalaFiltro(evento.target.value)
                        }
                    >
                        <option value="">
                            Todas as salas
                        </option>

                        {SALAS.map((sala) => (
                            <option
                                key={sala}
                                value={sala}
                            >
                                {sala}
                            </option>
                        ))}

                    </select>

                </div>

            </section>


            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (
                <div className="mensagem-erro-agendamento">
                    {erro}
                </div>
            )}
            


            {/* =================================================
                CONTEÚDO
            ================================================= */}

            <section className="area-agendamentos">

                {carregando ? (

                    <div className="estado-agendamentos">
                        Carregando agendamentos...
                    </div>

                ) : agendamentosFiltrados.length === 0 ? (

                    <div className="estado-agendamentos">

                        <CalendarDays size={42} />

                        <h3>
                            Nenhum agendamento encontrado
                        </h3>

                        <p>
                            Crie um novo agendamento para começar.
                        </p>

                    </div>

                ) : (

                    <div className="tabela-wrapper">

                        <table className="tabela-agendamentos">

                            <thead>

                                <tr>
                                    <th>Data</th>
                                    <th>Horário</th>
                                    <th>Sala</th>
                                    <th>Professor</th>
                                    <th>Turma</th>
                                    <th>Status</th>
                                </tr>

                            </thead>

                            <tbody>

                                {agendamentosFiltrados.map(
                                    (agendamento) => (

                                        <tr key={agendamento.id}>

                                            <td>
                                                {formatarData(
                                                    agendamento.data
                                                )}
                                            </td>

                                            <td>

                                                <div className="horario-tabela">

                                                    <strong>
                                                        {obterNomeAula(
                                                            agendamento.aula
                                                        )}
                                                    </strong>

                                                    <span>
                                                        <Clock3 size={14} />
                                                        {obterHorarioAula(
                                                            agendamento.aula
                                                        )}
                                                    </span>

                                                </div>

                                            </td>

                                            <td>

                                                <div className="sala-tabela">

                                                    <MapPin size={15} />

                                                    {agendamento.sala}

                                                </div>

                                            </td>

                                            <td>

                                                <div className="pessoa-tabela">

                                                    <UserRound size={15} />

                                                    {agendamento.professor}

                                                </div>

                                            </td>

                                            <td>

                                                <div className="turma-tabela">

                                                    <GraduationCap size={15} />

                                                    {agendamento.turma}

                                                </div>

                                            </td>

                                            <td>

                                                <span
                                                    className={`status-agendamento status-${agendamento.status?.toLowerCase()}`}
                                                >
                                                    {agendamento.status}
                                                </span>

                                            </td>
                                            <td>
    <button
        className="agendamento-botao-excluir"
        onClick={() => excluirAgendamento(agendamento.id)}
        title="Excluir agendamento"
    >
        <Trash2 size={17} />
    </button>
</td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>
            


            {/* =================================================
                MODAL
            ================================================= */}

            {modalAberto && (

                <div className="modal-fundo">

                    <div className="modal-agendamento">

                        <div className="cabecalho-modal">

                            <div>

                                <h2>
                                    Novo agendamento
                                </h2>

                                <p>
                                    Reserve uma sala para uma aula.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="botao-fechar-modal"
                                onClick={fecharModal}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            className="formulario-agendamento"
                            onSubmit={criarAgendamento}
                        >

                            <div className="campo-formulario">

                                <label>
                                    Professor
                                </label>

                                <select
                                    value={professorSelecionado}
                                    onChange={(evento) =>
                                        setProfessorSelecionado(
                                            evento.target.value
                                        )
                                    }
                                    required
                                >

                                    <option value="">
                                        Selecione o professor
                                    </option>

                                    {professores.map((professor) => (

                                        <option
                                            key={professor.id}
                                            value={professor.id}
                                        >
                                            {professor.nome}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            <div className="campo-formulario">

                                <label>
                                    Turma
                                </label>

                                <select
                                    value={turmaSelecionada}
                                    onChange={(evento) =>
                                        setTurmaSelecionada(
                                            evento.target.value
                                        )
                                    }
                                    required
                                >

                                    <option value="">
                                        Selecione a turma
                                    </option>

                                    {turmas.map((turma) => (

                                        <option
                                            key={turma.id}
                                            value={turma.id}
                                        >
                                            {turma.nome}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            <div className="linha-formulario">

                                <div className="campo-formulario">

                                    <label>
                                        Data
                                    </label>

                                    <input
                                        type="date"
                                        value={dataSelecionada}
                                        onChange={(evento) =>
                                            setDataSelecionada(
                                                evento.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <div className="campo-formulario">

                                    <label>
                                        Sala
                                    </label>

                                    <select
                                        value={salaSelecionada}
                                        onChange={(evento) =>
                                            setSalaSelecionada(
                                                evento.target.value
                                            )
                                        }
                                        required
                                    >

                                        <option value="">
                                            Selecione a sala
                                        </option>

                                        {SALAS.map((sala) => (

                                            <option
                                                key={sala}
                                                value={sala}
                                            >
                                                {sala}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                            </div>


                            <div className="campo-formulario">

                                <label>
                                    Aula
                                </label>

                                <select
                                    value={aulaSelecionada}
                                    onChange={(evento) =>
                                        setAulaSelecionada(
                                            evento.target.value
                                        )
                                    }
                                    required
                                >

                                    <option value="">
                                        Selecione a aula
                                    </option>

                                    {AULAS.map((aula) => (

                                        <option
                                            key={aula.numero}
                                            value={aula.numero}
                                        >
                                            {aula.numero}ª aula —{" "}
                                            {aula.inicio} às {aula.fim}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            <div className="campo-formulario">

                                <label>
                                    Observação
                                </label>

                                <textarea
                                    value={observacao}
                                    onChange={(evento) =>
                                        setObservacao(
                                            evento.target.value
                                        )
                                    }
                                    placeholder="Observação opcional..."
                                    maxLength={255}
                                    rows={3}
                                />

                            </div>


                            <div className="acoes-modal">

                                <button
                                    type="button"
                                    className="botao-cancelar"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="botao-salvar"
                                    disabled={salvando}
                                >
                                    <Plus size={17} />

                                    {salvando
                                        ? "Salvando..."
                                        : "Criar agendamento"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}

export default Agendamentos