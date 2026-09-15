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

    // =========================================================
    // ESTADOS
    // =========================================================

    // Guarda a quantidade total, emprestada e disponível
    const [resumo, setResumo] = useState(null)

    // Guarda os empréstimos ativos
    const [emprestimos, setEmprestimos] = useState([])

    // Texto usado na busca da tabela
    const [busca, setBusca] = useState("")

    // Controle de carregamento e erro da página
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState("")

    // Controla se o modal está aberto
    const [modalAberto, setModalAberto] = useState(false)


    // =========================================================
    // ESTADOS DO FORMULÁRIO
    // =========================================================

    // Lista de professores que vem do backend
    const [professores, setProfessores] = useState([])

    // Lista de turmas que vem do backend
    const [turmas, setTurmas] = useState([])

    // Professor escolhido no formulário
    const [professorSelecionado, setProfessorSelecionado] = useState("")

    // Turma escolhida no formulário
    const [turmaSelecionada, setTurmaSelecionada] = useState("")

    // Quantidade de Chromebooks
    const [quantidade, setQuantidade] = useState("")

    // Controle do botão de salvar
    const [salvando, setSalvando] = useState(false)

    // Erro específico do formulário
    const [erroFormulario, setErroFormulario] = useState("")


    // =========================================================
    // CARREGAR DADOS AO ABRIR A PÁGINA
    // =========================================================

    useEffect(() => {
        carregarEmprestimos()
    }, [])


    // =========================================================
    // CARREGAR EMPRÉSTIMOS
    // =========================================================

    async function carregarEmprestimos() {

        try {

            setCarregando(true)
            setErro("")

            console.log("[Empréstimos] Carregando dados...")


            // -------------------------------------------------
            // BUSCA A DISPONIBILIDADE DOS CHROMEBOOKS
            // -------------------------------------------------

            const disponibilidadeResposta =
                await api.get("/emprestimos/disponibilidade")

            console.log(
                "[Empréstimos] Disponibilidade:",
                disponibilidadeResposta.data
            )

            // Essa rota já retorna o objeto diretamente
            setResumo(disponibilidadeResposta.data)


            // -------------------------------------------------
            // BUSCA OS EMPRÉSTIMOS ATIVOS
            // -------------------------------------------------

            const emprestimosResposta =
                await api.get("/emprestimos/ativos")

            console.log(
                "[Empréstimos] Empréstimos ativos:",
                emprestimosResposta.data
            )


            // O backend retorna:
            //
            // {
            //     sucesso: true,
            //     total: 3,
            //     emprestimos: [...]
            // }

            const lista =
                emprestimosResposta.data.emprestimos || []


            console.log(
                "[Empréstimos] PRIMEIRO EMPRÉSTIMO:",
                lista[0]
            )

            console.log(
                "[Empréstimos] Lista final:",
                lista
            )


            setEmprestimos(lista)

        } catch (error) {

            console.error(
                "[Empréstimos] Erro ao carregar:",
                error
            )

            setErro(
                "Não foi possível carregar os empréstimos."
            )

        } finally {

            setCarregando(false)
        }
    }


    // =========================================================
    // CARREGAR PROFESSORES E TURMAS
    // =========================================================

    async function carregarDadosFormulario() {

        try {

            console.log(
                "[Empréstimos] Carregando professores e turmas..."
            )


            const [
                professoresResposta,
                turmasResposta
            ] = await Promise.all([

                api.get("/professores"),

                api.get("/turmas")

            ])


            // -------------------------------------------------
            // PROFESSORES
            // -------------------------------------------------

            const professoresDados =
                professoresResposta.data

            const listaProfessores =
                Array.isArray(professoresDados)
                    ? professoresDados
                    : professoresDados.professores || []


            // -------------------------------------------------
            // TURMAS
            // -------------------------------------------------

            const turmasDados =
                turmasResposta.data

            const listaTurmas =
                Array.isArray(turmasDados)
                    ? turmasDados
                    : turmasDados.turmas || []


            console.log(
                "[Empréstimos] Lista de professores:",
                listaProfessores
            )

            console.log(
                "[Empréstimos] Lista de turmas:",
                listaTurmas
            )


            setProfessores(listaProfessores)
            setTurmas(listaTurmas)

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
    // ABRIR MODAL
    // =========================================================

    function abrirModal() {

        // Limpa os campos
        setProfessorSelecionado("")
        setTurmaSelecionada("")
        setQuantidade("")
        setErroFormulario("")

        // Abre o modal
        setModalAberto(true)

        // Carrega professores e turmas
        carregarDadosFormulario()
    }


    // =========================================================
    // FECHAR MODAL
    // =========================================================

    function fecharModal() {

        setModalAberto(false)
        setErroFormulario("")
    }


    // =========================================================
    // REGISTRAR EMPRÉSTIMO
    // =========================================================

    async function registrarEmprestimo(event) {

        event.preventDefault()

        setErroFormulario("")


        // -------------------------------------------------
        // VALIDA PROFESSOR
        // -------------------------------------------------

        if (!professorSelecionado) {

            setErroFormulario(
                "Selecione um professor."
            )

            return
        }


        // -------------------------------------------------
        // VALIDA TURMA
        // -------------------------------------------------

        if (!turmaSelecionada) {

            setErroFormulario(
                "Selecione uma turma."
            )

            return
        }


        // -------------------------------------------------
        // CONVERTE QUANTIDADE PARA NÚMERO
        // -------------------------------------------------

        const quantidadeNumero =
            Number(quantidade)


        if (
            !quantidadeNumero ||
            quantidadeNumero <= 0
        ) {

            setErroFormulario(
                "Informe uma quantidade válida."
            )

            return
        }


        // -------------------------------------------------
        // CONFERE SE TEM CHROMEBOOK DISPONÍVEL
        // -------------------------------------------------

        if (
            resumo &&
            quantidadeNumero > resumo.disponiveis
        ) {

            setErroFormulario(
                "A quantidade informada é maior que a quantidade disponível."
            )

            return
        }


        try {

            setSalvando(true)


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
                quantidadeNumero
            )


            // -------------------------------------------------
            // ENVIA O EMPRÉSTIMO PARA O BACKEND
            // -------------------------------------------------

            const resposta =
                await api.post(
                    "/emprestimos",
                    {
                        professor_id:
                            Number(professorSelecionado),

                        turma_id:
                            Number(turmaSelecionada),

                        quantidade:
                            quantidadeNumero
                    }
                )


            console.log(
                "[Empréstimos] Empréstimo criado:",
                resposta.data
            )


            // Atualiza os cards e a tabela
            await carregarEmprestimos()

            // Fecha o modal
            fecharModal()

        } catch (error) {

            console.error(
                "[Empréstimos] Erro ao registrar:",
                error
            )

            setErroFormulario(
                error.response?.data?.mensagem ||
                "Não foi possível registrar o empréstimo."
            )

        } finally {

            setSalvando(false)
        }
    }


    // =========================================================
    // DEVOLVER EMPRÉSTIMO
    // =========================================================

    async function devolverEmprestimo(id) {

        try {

            console.log(
                "[Empréstimos] Devolvendo empréstimo:",
                id
            )


            await api.post(
                `/emprestimos/${id}/devolver`
            )


            console.log(
                "[Empréstimos] Empréstimo devolvido."
            )


            // Atualiza a tabela depois da devolução
            await carregarEmprestimos()

        } catch (error) {

            console.error(
                "[Empréstimos] Erro ao devolver:",
                error
            )

            setErro(
                "Não foi possível devolver o empréstimo."
            )
        }
    }


    // =========================================================
    // FILTRO DA TABELA
    // =========================================================

    const emprestimosFiltrados =
        emprestimos.filter((emprestimo) => {

            const texto =
                busca.toLowerCase()

            return (

                emprestimo.professor
                    ?.toLowerCase()
                    .includes(texto)

                ||

                emprestimo.turma
                    ?.toLowerCase()
                    .includes(texto)

            )
        })


    // =========================================================
    // JSX DA PÁGINA
    // =========================================================

    return (

        // =====================================================
        // CONTAINER PRINCIPAL
        // IMPORTANTE:
        // Seu CSS usa .emprestimos
        // =====================================================

        <div className="emprestimos">


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="pagina-cabecalho">

                <div>

                    <h1>
                        Empréstimos
                    </h1>

                    <p>
                        Controle os Chromebooks que estão em uso.
                    </p>

                </div>


                <button
                    type="button"
                    className="botao"
                    onClick={abrirModal}
                >

                    <Plus size={18} />

                    Novo empréstimo

                </button>

            </div>


            {/* =================================================
                ERRO DA PÁGINA
            ================================================= */}

            {erro && (

                <div className="emprestimos-erro">

                    {erro}

                </div>

            )}


            {/* =================================================
                CARDS DE RESUMO
            ================================================= */}

            <div className="cards">


                {/* CARD TOTAL */}

                <div className="card">

                    <div className="card-icone">

                        <Laptop size={22} />

                    </div>

                    <span>
                        Total de Chromebooks
                    </span>

                    <strong>
                        {resumo?.totalChromebooks ?? 47}
                    </strong>

                </div>



                {/* CARD EMPRESTADOS */}

                <div className="card">

                    <div className="card-icone">

                        <LaptopMinimal size={22} />

                    </div>

                    <span>
                        Emprestados
                    </span>

                    <strong>
                        {resumo?.emprestados ?? 0}
                    </strong>

                </div>



                {/* CARD DISPONÍVEIS */}

                <div className="card">

                    <div className="card-icone">

                        <CheckCircle2 size={22} />

                    </div>

                    <span>
                        Disponíveis
                    </span>

                    <strong>
                        {resumo?.disponiveis ?? 47}
                    </strong>

                </div>

            </div>



            {/* =================================================
                PAINEL DA TABELA
            ================================================= */}

            <div className="painel">


                {/* =================================================
                    CABEÇALHO DO PAINEL
                ================================================= */}

                <div className="painel-cabecalho">

                    <div>

                        <h2>
                            Empréstimos ativos
                        </h2>

                        <p>
                            Chromebooks que estão atualmente em uso.
                        </p>

                    </div>


                    {/* =================================================
                        CAMPO DE BUSCA
                    ================================================= */}

                    <div className="campo-busca">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Buscar professor ou turma..."
                            value={busca}
                            onChange={(event) =>
                                setBusca(event.target.value)
                            }
                        />

                    </div>

                </div>



                {/* =================================================
                    TABELA
                ================================================= */}

                <div className="tabela-container">

                    <table className="tabela">


                        {/* CABEÇALHO DAS COLUNAS */}

                        <thead>

                            <tr>

                                <th>
                                    Professor
                                </th>

                                <th>
                                    Turma
                                </th>

                                <th>
                                    Quantidade
                                </th>

                                <th>
                                    Data de retirada
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Ações
                                </th>

                            </tr>

                        </thead>



                        <tbody>


                            {/* =================================================
                                ESTADO DE CARREGAMENTO
                            ================================================= */}

                            {carregando ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="tabela-vazia"
                                    >
                                        Carregando empréstimos...
                                    </td>

                                </tr>


                            ) : emprestimosFiltrados.length === 0 ? (


                                /* =================================================
                                    NENHUM EMPRÉSTIMO
                                ================================================= */

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="tabela-vazia"
                                    >
                                        Nenhum empréstimo ativo encontrado.
                                    </td>

                                </tr>


                            ) : (


                                /* =================================================
                                    MAP DA TABELA

                                    É AQUI QUE CADA EMPRÉSTIMO VIRA UMA LINHA.

                                    emprestimosFiltrados
                                    ↓
                                    empréstimo 1
                                    empréstimo 2
                                    empréstimo 3
                                    ↓
                                    <tr>
                                    <tr>
                                    <tr>

                                    Se você quiser mudar o que aparece
                                    em cada linha, é AQUI.
                                ================================================= */

                                emprestimosFiltrados.map(
                                    (emprestimo) => (

                                        <tr
                                            key={emprestimo.id}
                                        >


                                            {/* ==============================
                                                PROFESSOR
                                            ============================== */}

                                            <td>

                                                <strong>
                                                    {emprestimo.professor || "-"}
                                                </strong>

                                            </td>



                                            {/* ==============================
                                                TURMA

                                                O backend retorna:
                                                emprestimo.turma

                                                Exemplo:
                                                "3A"
                                            ============================== */}

                                            <td>

                                                {emprestimo.turma || "-"}

                                            </td>



                                            {/* ==============================
                                                QUANTIDADE
                                            ============================== */}

                                            <td>

                                                {emprestimo.quantidade}

                                            </td>



                                            {/* ==============================
                                                DATA DA RETIRADA
                                            ============================== */}

                                            <td>

                                                {emprestimo.data_retirada

                                                    ? new Date(
                                                        emprestimo.data_retirada
                                                    ).toLocaleString(
                                                        "pt-BR"
                                                    )

                                                    : "-"

                                                }

                                            </td>



                                            {/* ==============================
                                                STATUS
                                            ============================== */}

                                            <td>

                                                <span className="status-ativo">

                                                    Em uso

                                                </span>

                                            </td>



                                            {/* ==============================
                                                AÇÃO DE DEVOLVER
                                            ============================== */}

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

                                                    <RotateCcw size={16} />

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



            {/* =================================================
                MODAL
            ================================================= */}

            {modalAberto && (

                <div className="modal-fundo">

                    <div className="modal">


                        {/* =================================================
                            CABEÇALHO DO MODAL
                        ================================================= */}

                        <div className="modal-cabecalho">

                            <div>

                                <h2>
                                    Novo empréstimo
                                </h2>

                                <p>
                                    Registre a retirada de Chromebooks.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-fechar"
                                onClick={fecharModal}
                            >
                                ×
                            </button>

                        </div>



                        {/* =================================================
                            FORMULÁRIO

                            Seu CSS usa .formulario
                        ================================================= */}

                        <form
                            className="formulario"
                            onSubmit={registrarEmprestimo}
                        >


                            {/* =================================================
                                ERRO DO MODAL
                            ================================================= */}

                            {erroFormulario && (

                                <div className="modal-erro">

                                    {erroFormulario}

                                </div>

                            )}



                            {/* =================================================
                                PROFESSOR
                            ================================================= */}

                            <div className="campo">

                                <label className="campo-label">
                                    Professor
                                </label>

                                <select
                                    className="campo-input"
                                    value={professorSelecionado}
                                    onChange={(event) =>
                                        setProfessorSelecionado(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Selecione um professor
                                    </option>


                                    {/* MAP DOS PROFESSORES */}

                                    {professores.map(
                                        (professor) => (

                                            <option
                                                key={professor.id}
                                                value={professor.id}
                                            >

                                                {professor.nome}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>



                            {/* =================================================
                                TURMA
                            ================================================= */}

                            <div className="campo">

                                <label className="campo-label">
                                    Turma
                                </label>

                                <select
                                    className="campo-input"
                                    value={turmaSelecionada}
                                    onChange={(event) =>
                                        setTurmaSelecionada(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Selecione uma turma
                                    </option>


                                    {/* MAP DAS TURMAS */}

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



                            {/* =================================================
                                QUANTIDADE
                            ================================================= */}

                            <div className="campo">

                                <label className="campo-label">
                                    Quantidade de Chromebooks
                                </label>

                                <input
                                    className="campo-input"
                                    type="number"
                                    min="1"
                                    max={
                                        resumo?.disponiveis ?? 47
                                    }
                                    value={quantidade}
                                    onChange={(event) =>
                                        setQuantidade(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ex: 10"
                                />

                            </div>



                            {/* =================================================
                                DISPONIBILIDADE
                            ================================================= */}

                            <div className="modal-disponibilidade">

                                <span>
                                    Chromebooks disponíveis:
                                </span>

                                <strong>
                                    {resumo?.disponiveis ?? 47}
                                </strong>

                            </div>



                            {/* =================================================
                                BOTÕES DO MODAL
                            ================================================= */}

                            <div className="modal-acoes">

                                <button
                                    type="button"
                                    className="botao"
                                    onClick={fecharModal}
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    className="botao"
                                    disabled={salvando}
                                >

                                    {salvando
                                        ? "Salvando..."
                                        : "Registrar empréstimo"
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


export default Emprestimos