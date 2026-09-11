import { useEffect, useState } from "react"
import {
    Plus,
    Laptop,
    LaptopMinimal,
    CheckCircle2,
    Search,
    RotateCcw
} from "lucide-react"

import api from "../../services/api"
import "./Emprestimos.css"

function Emprestimos() {
    // Dados principais da página
    const [resumo, setResumo] = useState(null)
    const [emprestimos, setEmprestimos] = useState([])
    const [busca, setBusca] = useState("")
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState("")

    // Controle do modal
    const [modalAberto, setModalAberto] = useState(false)

    // Professores e turmas usados no formulário
    const [professores, setProfessores] = useState([])
    const [turmas, setTurmas] = useState([])

    // Valores escolhidos no formulário
    const [professorSelecionado, setProfessorSelecionado] = useState("")
    const [turmaSelecionada, setTurmaSelecionada] = useState("")
    const [quantidade, setQuantidade] = useState("")

    // Controle do cadastro
    const [salvando, setSalvando] = useState(false)
    const [erroFormulario, setErroFormulario] = useState("")

    // Carrega os dados assim que a página abre
    useEffect(() => {
        carregarEmprestimos()
    }, [])

    // =========================================================
    // CARREGA DISPONIBILIDADE E EMPRÉSTIMOS
    // =========================================================

    async function carregarEmprestimos() {
        console.log("================================")
        console.log("[Empréstimos] Carregando dados...")
        console.log("================================")

        try {
            setCarregando(true)
            setErro("")

            const [
                disponibilidadeResposta,
                emprestimosResposta
            ] = await Promise.all([
                api.get("/emprestimos/disponibilidade"),
                api.get("/emprestimos/ativos")
            ])

            console.log(
                "[Empréstimos] Disponibilidade:",
                disponibilidadeResposta.data
            )

            console.log(
                "[Empréstimos] Empréstimos ativos:",
                emprestimosResposta.data
            )

            // A disponibilidade vem DIRETAMENTE no objeto
            //
            // Exemplo:
            // {
            //     sucesso: true,
            //     totalChromebooks: 47,
            //     emprestados: 0,
            //     disponiveis: 47
            // }
            const disponibilidade = disponibilidadeResposta.data

            // Guardamos exatamente esse objeto no estado
            setResumo(disponibilidade)

            const emprestimosDados = emprestimosResposta.data

            // Empréstimos podem vir como array ou dentro de "dados"
            if (Array.isArray(emprestimosDados)) {
                setEmprestimos(emprestimosDados)
            } else {
                setEmprestimos(
                    emprestimosDados.dados || []
                )
            }

            console.log(
                "[Empréstimos] Resumo salvo no estado:",
                disponibilidade
            )

            console.log(
                "[Empréstimos] Total:",
                disponibilidade.totalChromebooks
            )

            console.log(
                "[Empréstimos] Emprestados:",
                disponibilidade.emprestados
            )

            console.log(
                "[Empréstimos] Disponíveis:",
                disponibilidade.disponiveis
            )
        } catch (error) {
            console.error("================================")
            console.error(
                "[Empréstimos] ERRO AO CARREGAR"
            )
            console.error(
                "[Empréstimos] Mensagem:",
                error.message
            )
            console.error(
                "[Empréstimos] Status:",
                error.response?.status
            )
            console.error(
                "[Empréstimos] URL:",
                error.config?.url
            )
            console.error(
                "[Empréstimos] Resposta:",
                error.response?.data
            )
            console.error(
                "[Empréstimos] Erro completo:",
                error
            )
            console.error("================================")

            setErro(
                "Não foi possível carregar os empréstimos."
            )
        } finally {
            setCarregando(false)
        }
    }

    // =========================================================
    // CARREGA PROFESSORES E TURMAS
    // =========================================================

    async function carregarDadosFormulario() {
        console.log(
            "[Empréstimos] Carregando professores e turmas..."
        )

        try {
            const [
                professoresResposta,
                turmasResposta
            ] = await Promise.all([
                api.get("/professores"),
                api.get("/turmas")
            ])

            console.log(
                "[Empréstimos] Professores:",
                professoresResposta.data
            )

            console.log(
                "[Empréstimos] Turmas:",
                turmasResposta.data
            )

            const professoresDados =
                professoresResposta.data

            const turmasDados =
                turmasResposta.data

            setProfessores(
                Array.isArray(professoresDados)
                    ? professoresDados
                    : professoresDados.dados || []
            )

            setTurmas(
                Array.isArray(turmasDados)
                    ? turmasDados
                    : turmasDados.dados || []
            )
        } catch (error) {
            console.error(
                "[Empréstimos] Erro ao carregar formulário:",
                error
            )

            setErroFormulario(
                "Não foi possível carregar professores e turmas."
            )
        }
    }

    // =========================================================
    // ABRE O MODAL
    // =========================================================

    function abrirModal() {
        console.log(
            "[Empréstimos] Abrindo novo empréstimo."
        )

        setProfessorSelecionado("")
        setTurmaSelecionada("")
        setQuantidade("")
        setErroFormulario("")

        setModalAberto(true)

        carregarDadosFormulario()
    }

    // =========================================================
    // REGISTRA EMPRÉSTIMO
    // =========================================================

    async function registrarEmprestimo(evento) {
        evento.preventDefault()

        console.log("================================")
        console.log(
            "[Empréstimos] Registrando empréstimo..."
        )
        console.log(
            "[Empréstimos] Professor:",
            professorSelecionado
        )
        console.log(
            "[Empréstimos] Turma:",
            turmaSelecionada
        )
        console.log(
            "[Empréstimos] Quantidade:",
            quantidade
        )
        console.log("================================")

        setErroFormulario("")

        if (!professorSelecionado) {
            setErroFormulario(
                "Selecione um professor."
            )
            return
        }

        if (!turmaSelecionada) {
            setErroFormulario(
                "Selecione uma turma."
            )
            return
        }

        const quantidadeNumero = Number(quantidade)

        if (!quantidadeNumero || quantidadeNumero <= 0) {
            setErroFormulario(
                "Informe uma quantidade válida de Chromebooks."
            )
            return
        }

        // Aqui usamos o nome REAL que vem da API
        if (
            resumo?.disponiveis !== undefined &&
            quantidadeNumero > Number(resumo.disponiveis)
        ) {
            setErroFormulario(
                "A quantidade informada é maior que a disponibilidade atual."
            )
            return
        }

        try {
            setSalvando(true)

            const resposta = await api.post(
                "/emprestimos",
                {
                    professor_id: Number(
                        professorSelecionado
                    ),
                    turma_id: Number(
                        turmaSelecionada
                    ),
                    quantidade: quantidadeNumero
                }
            )

            console.log(
                "[Empréstimos] Empréstimo criado:",
                resposta.data
            )

            setModalAberto(false)

            // Atualiza cards e tabela
            await carregarEmprestimos()
        } catch (error) {
            console.error("================================")
            console.error(
                "[Empréstimos] ERRO AO REGISTRAR"
            )
            console.error(
                "[Empréstimos] Mensagem:",
                error.message
            )
            console.error(
                "[Empréstimos] Status:",
                error.response?.status
            )
            console.error(
                "[Empréstimos] Resposta:",
                error.response?.data
            )
            console.error("================================")

            setErroFormulario(
                error.response?.data?.mensagem ||
                "Não foi possível registrar o empréstimo."
            )
        } finally {
            setSalvando(false)
        }
    }

    // =========================================================
    // DEVOLVE EMPRÉSTIMO
    // =========================================================

    async function devolverEmprestimo(id) {
        console.log("================================")
        console.log(
            "[Empréstimos] Iniciando devolução..."
        )
        console.log(
            "[Empréstimos] ID:",
            id
        )
        console.log("================================")

        const confirmar = window.confirm(
            "Tem certeza que deseja registrar a devolução deste empréstimo?"
        )

        if (!confirmar) {
            console.log(
                "[Empréstimos] Devolução cancelada."
            )
            return
        }

        try {
            const resposta = await api.post(
                `/emprestimos/${id}/devolver`
            )

            console.log(
                "[Empréstimos] Devolução realizada:",
                resposta.data
            )

            // Depois da devolução, atualiza tudo novamente
            await carregarEmprestimos()

            console.log(
                "[Empréstimos] Dados atualizados após devolução."
            )
        } catch (error) {
            console.error("================================")
            console.error(
                "[Empréstimos] ERRO AO DEVOLVER"
            )
            console.error(
                "[Empréstimos] Mensagem:",
                error.message
            )
            console.error(
                "[Empréstimos] Status:",
                error.response?.status
            )
            console.error(
                "[Empréstimos] Resposta:",
                error.response?.data
            )
            console.error("================================")

            alert(
                error.response?.data?.mensagem ||
                "Não foi possível registrar a devolução."
            )
        }
    }

    // =========================================================
    // FILTRO DA TABELA
    // =========================================================

    const emprestimosFiltrados =
        emprestimos.filter((emprestimo) => {
            const texto = busca.toLowerCase()

            return (
                emprestimo.professor_nome
                    ?.toLowerCase()
                    .includes(texto) ||
                emprestimo.turma_nome
                    ?.toLowerCase()
                    .includes(texto)
            )
        })

    // =========================================================
    // CARREGANDO
    // =========================================================

    if (carregando) {
        return (
            <section className="emprestimos">
                <div className="emprestimos-carregando">
                    Carregando empréstimos...
                </div>
            </section>
        )
    }

    // =========================================================
    // ERRO
    // =========================================================

    if (erro) {
        return (
            <section className="emprestimos">
                <div className="emprestimos-erro">
                    {erro}
                </div>
            </section>
        )
    }

    // =========================================================
    // TELA PRINCIPAL
    // =========================================================

    return (
        <section className="emprestimos">

            {/* Cabeçalho */}
            <header className="cabecalho">
                <div>
                    <h1 className="titulo">
                        Empréstimos
                    </h1>

                    <p className="subtitulo">
                        Controle de retirada e devolução dos Chromebooks.
                    </p>
                </div>

                <button
                    type="button"
                    className="botao botao-principal"
                    onClick={abrirModal}
                >
                    <Plus size={18} />
                    Novo empréstimo
                </button>
            </header>

            {/* Cards */}
            <div className="cards">

                {/* Total */}
                <div className="card">
                    <div className="card-icone card-icone-azul">
                        <Laptop size={21} />
                    </div>

                    <p className="card-titulo">
                        Total de Chromebooks
                    </p>

                    <strong className="card-numero">
                        {resumo?.totalChromebooks}
                    </strong>

                    <span className="card-descricao">
                        Equipamentos cadastrados
                    </span>
                </div>

                {/* Emprestados */}
                <div className="card">
                    <div className="card-icone card-icone-roxo">
                        <LaptopMinimal size={21} />
                    </div>

                    <p className="card-titulo">
                        Chromebooks emprestados
                    </p>

                    <strong className="card-numero">
                        {resumo?.emprestados}
                    </strong>

                    <span className="card-descricao">
                        Equipamentos atualmente em uso
                    </span>
                </div>

                {/* Disponíveis */}
                <div className="card">
                    <div className="card-icone card-icone-laranja">
                        <CheckCircle2 size={21} />
                    </div>

                    <p className="card-titulo">
                        Chromebooks disponíveis
                    </p>

                    <strong className="card-numero">
                        {resumo?.disponiveis}
                    </strong>

                    <span className="card-descricao">
                        Equipamentos disponíveis para empréstimo
                    </span>
                </div>

            </div>

            {/* Tabela */}
            <div className="painel">

                <div className="painel-cabecalho">

                    <div>
                        <h2 className="painel-titulo">
                            Empréstimos ativos
                        </h2>

                        <p className="painel-descricao">
                            Chromebooks que estão atualmente em uso.
                        </p>
                    </div>

                    <div className="campo-busca">
                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Pesquisar professor ou turma..."
                            value={busca}
                            onChange={(evento) =>
                                setBusca(
                                    evento.target.value
                                )
                            }
                        />
                    </div>

                </div>

                <div className="tabela-container">

                    <table className="tabela">

                        <thead>
                            <tr>
                                <th>Professor</th>
                                <th>Turma</th>
                                <th>Quantidade</th>
                                <th>Retirada</th>
                                <th>Status</th>
                                <th>Ação</th>
                            </tr>
                        </thead>

                        <tbody>

                            {emprestimosFiltrados.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="tabela-vazia"
                                    >
                                        Nenhum empréstimo ativo encontrado.
                                    </td>
                                </tr>
                            ) : (
                                emprestimosFiltrados.map(
                                    (emprestimo) => (
                                        <tr
                                            key={emprestimo.id}
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        emprestimo.professor_nome
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    emprestimo.turma_nome
                                                }
                                            </td>

                                            <td>
                                                {
                                                    emprestimo.quantidade
                                                }
                                            </td>

                                            <td>
                                                {
                                                    emprestimo.data_retirada
                                                }
                                            </td>

                                            <td>
                                                <span className="status status-ativo">
                                                    Em uso
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="botao-devolver"
                                                    title="Devolver Chromebooks"
                                                    onClick={() =>
                                                        devolverEmprestimo(
                                                            emprestimo.id
                                                        )
                                                    }
                                                >
                                                    <RotateCcw
                                                        size={17}
                                                    />
                                                    Devolver
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* Modal de novo empréstimo */}
            {modalAberto && (
                <div
                    className="modal-fundo"
                    onClick={() =>
                        setModalAberto(false)
                    }
                >
                    <div
                        className="modal"
                        onClick={(evento) =>
                            evento.stopPropagation()
                        }
                    >

                        <div className="modal-cabecalho">

                            <div>
                                <h2>
                                    Novo empréstimo
                                </h2>

                                <p>
                                    Registre a retirada dos Chromebooks.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-fechar"
                                onClick={() =>
                                    setModalAberto(false)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="formulario"
                            onSubmit={
                                registrarEmprestimo
                            }
                        >

                            {/* Professor */}
                            <div className="campo">

                                <label className="campo-label">
                                    Professor
                                </label>

                                <select
                                    className="campo-input"
                                    value={
                                        professorSelecionado
                                    }
                                    onChange={(evento) =>
                                        setProfessorSelecionado(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Selecione o professor
                                    </option>

                                    {professores.map(
                                        (professor) => (
                                            <option
                                                key={
                                                    professor.id
                                                }
                                                value={
                                                    professor.id
                                                }
                                            >
                                                {
                                                    professor.nome
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                            </div>

                            {/* Turma */}
                            <div className="campo">

                                <label className="campo-label">
                                    Turma
                                </label>

                                <select
                                    className="campo-input"
                                    value={
                                        turmaSelecionada
                                    }
                                    onChange={(evento) =>
                                        setTurmaSelecionada(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Selecione a turma
                                    </option>

                                    {turmas.map(
                                        (turma) => (
                                            <option
                                                key={turma.id}
                                                value={turma.id}
                                            >
                                                {turma.nome}
                                            </option>
                                        )
                                    )}
                                </select>

                            </div>

                            {/* Quantidade */}
                            <div className="campo">

                                <label className="campo-label">
                                    Quantidade de Chromebooks
                                </label>

                                <input
                                    className="campo-input"
                                    type="number"
                                    min="1"
                                    value={quantidade}
                                    onChange={(evento) =>
                                        setQuantidade(
                                            evento.target.value
                                        )
                                    }
                                    placeholder="Ex.: 10"
                                />

                            </div>

                            {/* Disponibilidade atual */}
                            <div className="modal-disponibilidade">

                                <LaptopMinimal
                                    size={18}
                                />

                                <span>
                                    Disponíveis agora:

                                    <strong>
                                        {" "}
                                        {resumo?.disponiveis}
                                    </strong>
                                </span>

                            </div>

                            {/* Erro do formulário */}
                            {erroFormulario && (
                                <div className="modal-erro">
                                    {erroFormulario}
                                </div>
                            )}

                            {/* Botões */}
                            <div className="modal-acoes">

                                <button
                                    type="button"
                                    className="botao botao-secundario"
                                    onClick={() =>
                                        setModalAberto(false)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="botao botao-principal"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Registrando..."
                                        : "Registrar empréstimo"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </section>
    )
}

export default Emprestimos