import { useEffect, useMemo, useState } from "react"

import {
    Plus,
    Search,
    AlertTriangle,
    Clock3,
    CheckCircle2,
    ClipboardList,
    Check,
    X,
    RefreshCw,
    Pencil,
    Trash2,
    Save
} from "lucide-react"

import api from "../../services/api"

import "./Ocorrencias.css"


function Ocorrencias() {

    // =========================================================
    // ESTADOS DA TELA
    // =========================================================

    const [ocorrencias, setOcorrencias] = useState([])

    const [professores, setProfessores] = useState([])

    const [busca, setBusca] = useState("")

    const [filtroStatus, setFiltroStatus] = useState("todos")

    const [carregando, setCarregando] = useState(true)

    const [erro, setErro] = useState("")

    const [mensagemSucesso, setMensagemSucesso] = useState("")


    // =========================================================
    // MODAL DE NOVA OCORRÊNCIA
    // =========================================================

    const [modalAberto, setModalAberto] = useState(false)

    const [salvando, setSalvando] = useState(false)

    const [erroFormulario, setErroFormulario] = useState("")


    // =========================================================
    // FORMULÁRIO DE NOVA OCORRÊNCIA
    // =========================================================

    const [professorSelecionado, setProfessorSelecionado] = useState("")

    const [sala, setSala] = useState("")

    const [tipo, setTipo] = useState("")

    const [descricao, setDescricao] = useState("")


    // =========================================================
    // MODAL DE ALTERAÇÃO DE STATUS
    // =========================================================

    const [modalStatusAberto, setModalStatusAberto] = useState(false)

    const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
        useState(null)

    const [novoStatus, setNovoStatus] = useState("")

    const [salvandoStatus, setSalvandoStatus] = useState(false)


    // =========================================================
    // EXCLUSÃO
    // =========================================================

    const [excluindoId, setExcluindoId] = useState(null)


    // =========================================================
    // CARREGAMENTO INICIAL
    // =========================================================

    useEffect(() => {

        console.log("[Ocorrências] Tela iniciada.")

        carregarOcorrencias()

        carregarProfessores()

    }, [])


    // =========================================================
    // BUSCAR OCORRÊNCIAS
    // =========================================================

    async function carregarOcorrencias() {

        try {

            setCarregando(true)

            setErro("")

            console.log(
                "[Ocorrências] Buscando ocorrências na API..."
            )

            const resposta = await api.get("/ocorrencias")

            console.log(
                "[Ocorrências] Resposta da API:",
                resposta.data
            )

            const dados = resposta.data

            const lista = Array.isArray(dados)
                ? dados
                : dados.ocorrencias || dados.dados || []

            console.log(
                "[Ocorrências] Total recebido:",
                lista.length
            )

            setOcorrencias(lista)

        } catch (error) {

            console.error(
                "[Ocorrências] Erro ao carregar ocorrências:",
                error
            )

            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível carregar as ocorrências."
            )

        } finally {

            setCarregando(false)

        }
    }


    // =========================================================
    // BUSCAR PROFESSORES
    // =========================================================

    async function carregarProfessores() {

        try {

            console.log(
                "[Ocorrências] Buscando professores..."
            )

            const resposta = await api.get("/professores")

            console.log(
                "[Ocorrências] Resposta dos professores:",
                resposta.data
            )

            const dados = resposta.data

            const lista = Array.isArray(dados)
                ? dados
                : dados.professores || dados.dados || []

            console.log(
                "[Ocorrências] Professores encontrados:",
                lista.length
            )

            setProfessores(lista)

        } catch (error) {

            console.error(
                "[Ocorrências] Erro ao carregar professores:",
                error
            )

        }
    }


    // =========================================================
    // ABRIR MODAL DE NOVA OCORRÊNCIA
    // =========================================================

    function abrirModal() {

        console.log(
            "[Ocorrências] Abrindo formulário de nova ocorrência."
        )

        setProfessorSelecionado("")

        setSala("")

        setTipo("")

        setDescricao("")

        setErroFormulario("")

        setModalAberto(true)
    }


    // =========================================================
    // FECHAR MODAL DE NOVA OCORRÊNCIA
    // =========================================================

    function fecharModal() {

        console.log(
            "[Ocorrências] Fechando formulário."
        )

        setModalAberto(false)

        setErroFormulario("")
    }


    // =========================================================
    // CADASTRAR OCORRÊNCIA
    // =========================================================

    async function registrarOcorrencia(event) {

        event.preventDefault()

        setErroFormulario("")

        setMensagemSucesso("")


        // -----------------------------------------------------
        // VALIDAÇÕES
        // -----------------------------------------------------

        if (!professorSelecionado) {

            setErroFormulario(
                "Selecione o professor relacionado à ocorrência."
            )

            return
        }


        if (!sala.trim()) {

            setErroFormulario(
                "Informe a sala onde ocorreu o problema."
            )

            return
        }


        if (!tipo) {

            setErroFormulario(
                "Selecione o tipo da ocorrência."
            )

            return
        }


        if (!descricao.trim()) {

            setErroFormulario(
                "Descreva o problema encontrado."
            )

            return
        }


        // -----------------------------------------------------
        // ENVIO PARA API
        // -----------------------------------------------------

        try {

            setSalvando(true)

            console.log(
                "[Ocorrências] Iniciando cadastro..."
            )


            const dados = {

                professor_id: Number(professorSelecionado),

                sala: sala.trim(),

                tipo,

                descricao: descricao.trim()

            }


            console.log(
                "[Ocorrências] Dados enviados:",
                dados
            )


            const resposta = await api.post(
                "/ocorrencias",
                dados
            )


            console.log(
                "[Ocorrências] Cadastro realizado:",
                resposta.data
            )


            // O backend já define o status inicial.
            await carregarOcorrencias()


            fecharModal()


            setMensagemSucesso(
                "Ocorrência registrada com sucesso."
            )


        } catch (error) {

            console.error(
                "[Ocorrências] Erro ao registrar:",
                error
            )


            setErroFormulario(
                error.response?.data?.mensagem ||
                "Não foi possível registrar a ocorrência."
            )

        } finally {

            setSalvando(false)

        }
    }


    // =========================================================
    // ABRIR MODAL DE STATUS
    // =========================================================

    function abrirModalStatus(ocorrencia) {

        console.log(
            "[Ocorrências] Alterando status da ocorrência:",
            ocorrencia.id
        )


        setOcorrenciaSelecionada(ocorrencia)

        setNovoStatus(
            ocorrencia.status || "RESOLVIDA"
        )

        setErro("")

        setModalStatusAberto(true)
    }


    // =========================================================
    // FECHAR MODAL DE STATUS
    // =========================================================

    function fecharModalStatus() {

        setModalStatusAberto(false)

        setOcorrenciaSelecionada(null)

        setNovoStatus("")

    }


    // =========================================================
    // ALTERAR STATUS
    // =========================================================

    async function alterarStatus() {

        if (!ocorrenciaSelecionada) {

            return
        }


        try {

            setSalvandoStatus(true)

            setErro("")

            console.log(
                "[Ocorrências] Salvando novo status:",
                {
                    id: ocorrenciaSelecionada.id,
                    status: novoStatus
                }
            )


            const resposta = await api.put(
                `/ocorrencias/${ocorrenciaSelecionada.id}`,
                {
                    status: novoStatus
                }
            )


            console.log(
                "[Ocorrências] Status atualizado:",
                resposta.data
            )


            await carregarOcorrencias()


            fecharModalStatus()


            setMensagemSucesso(
                "Status da ocorrência atualizado com sucesso."
            )


        } catch (error) {

            console.error(
                "[Ocorrências] Erro ao alterar status:",
                error
            )


            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível alterar o status."
            )

        } finally {

            setSalvandoStatus(false)

        }
    }


    // =========================================================
    // EXCLUIR OCORRÊNCIA
    // =========================================================

    async function excluirOcorrencia(id) {

        const confirmar = window.confirm(
            "Tem certeza que deseja excluir esta ocorrência?"
        )


        if (!confirmar) {

            console.log(
                "[Ocorrências] Exclusão cancelada."
            )

            return
        }


        try {

            setExcluindoId(id)

            setErro("")


            console.log(
                "[Ocorrências] Excluindo ocorrência:",
                id
            )


            const resposta = await api.delete(
                `/ocorrencias/${id}`
            )


            console.log(
                "[Ocorrências] Ocorrência excluída:",
                resposta.data
            )


            await carregarOcorrencias()


            setMensagemSucesso(
                "Ocorrência excluída com sucesso."
            )


        } catch (error) {

            console.error(
                "[Ocorrências] Erro ao excluir:",
                error
            )


            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível excluir a ocorrência."
            )

        } finally {

            setExcluindoId(null)

        }
    }


    // =========================================================
    // FILTRO DA TABELA
    // =========================================================

    const ocorrenciasFiltradas = useMemo(() => {

        const texto = busca.toLowerCase().trim()


        return ocorrencias.filter((ocorrencia) => {

            const textoOcorrencia = [

                ocorrencia.professor,

                ocorrencia.professor_nome,

                ocorrencia.sala,

                ocorrencia.tipo,

                ocorrencia.descricao

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()


            const correspondeBusca =
                textoOcorrencia.includes(texto)


            const correspondeStatus =
                filtroStatus === "todos" ||
                ocorrencia.status === filtroStatus


            return (
                correspondeBusca &&
                correspondeStatus
            )

        })

    }, [
        ocorrencias,
        busca,
        filtroStatus
    ])


    // =========================================================
    // INDICADORES
    // =========================================================

    const totalOcorrencias =
        ocorrencias.length


    const abertas =
        ocorrencias.filter(
            (ocorrencia) =>
                ocorrencia.status === "ABERTA"
        ).length


    const andamento =
        ocorrencias.filter(
            (ocorrencia) =>
                ocorrencia.status === "EM_ANDAMENTO"
        ).length


    const resolvidas =
        ocorrencias.filter(
            (ocorrencia) =>
                ocorrencia.status === "RESOLVIDA"
        ).length


    // =========================================================
    // MOSTRAR STATUS
    // =========================================================

    function mostrarStatus(status) {

        if (status === "RESOLVIDA") {

            return (

                <span className="status-ocorrencia status-resolvida">

                    <CheckCircle2 size={14} />

                    Resolvida

                </span>

            )
        }


        if (status === "EM_ANDAMENTO") {

            return (

                <span className="status-ocorrencia status-andamento">

                    <Clock3 size={14} />

                    Em andamento

                </span>

            )
        }


        return (

            <span className="status-ocorrencia status-aberta">

                <AlertTriangle size={14} />

                Aberta

            </span>

        )
    }


    // =========================================================
    // TELA
    // =========================================================

    return (

        <div className="ocorrencias">


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <header className="ocorrencias-cabecalho">

                <div>

                    <span className="ocorrencias-overline">
                        ATENDIMENTO PROATI
                    </span>

                    <h1>
                        Ocorrências
                    </h1>

                    <p>
                        Registre, acompanhe e resolva problemas
                        identificados no ambiente escolar.
                    </p>

                </div>


                <button
                    type="button"
                    className="botao botao-principal"
                    onClick={abrirModal}
                >

                    <Plus size={18} />

                    Nova ocorrência

                </button>

            </header>


            {/* =================================================
                MENSAGEM DE SUCESSO
            ================================================= */}

            {mensagemSucesso && (

                <div className="mensagem-sucesso">

                    <CheckCircle2 size={17} />

                    <span>
                        {mensagemSucesso}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setMensagemSucesso("")
                        }
                    >

                        <X size={16} />

                    </button>

                </div>

            )}


            {/* =================================================
                MENSAGEM DE ERRO
            ================================================= */}

            {erro && (

                <div className="mensagem-erro">

                    <AlertTriangle size={17} />

                    <span>
                        {erro}
                    </span>


                    <button
                        type="button"
                        onClick={() => setErro("")}
                    >

                        <X size={16} />

                    </button>

                </div>

            )}


            {/* =================================================
                CARDS
            ================================================= */}

            <section className="cards">


                <div className="card">

                    <div className="card-icone card-icone-roxo">

                        <ClipboardList size={21} />

                    </div>


                    <div className="card-conteudo">

                        <span>
                            Total de ocorrências
                        </span>

                        <strong>
                            {totalOcorrencias}
                        </strong>

                    </div>

                </div>


                <div className="card">

                    <div className="card-icone card-icone-laranja">

                        <AlertTriangle size={21} />

                    </div>


                    <div className="card-conteudo">

                        <span>
                            Em aberto
                        </span>

                        <strong>
                            {abertas}
                        </strong>

                    </div>

                </div>


                <div className="card">

                    <div className="card-icone card-icone-azul">

                        <Clock3 size={21} />

                    </div>


                    <div className="card-conteudo">

                        <span>
                            Em andamento
                        </span>

                        <strong>
                            {andamento}
                        </strong>

                    </div>

                </div>


                <div className="card">

                    <div className="card-icone card-icone-verde">

                        <CheckCircle2 size={21} />

                    </div>


                    <div className="card-conteudo">

                        <span>
                            Resolvidas
                        </span>

                        <strong>
                            {resolvidas}
                        </strong>

                    </div>

                </div>


            </section>


            {/* =================================================
                PAINEL PRINCIPAL
            ================================================= */}

            <section className="painel">


                <div className="painel-cabecalho">

                    <div>

                        <h2>
                            Registro de ocorrências
                        </h2>

                        <p>
                            Consulte e acompanhe os atendimentos
                            registrados pelo PROATI.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="botao-atualizar"
                        onClick={carregarOcorrencias}
                        title="Atualizar ocorrências"
                    >

                        <RefreshCw size={16} />

                        Atualizar

                    </button>

                </div>


                {/* =================================================
                    FILTROS
                ================================================= */}

                <div className="ocorrencias-filtros">


                    <div className="campo-busca">

                        <Search size={17} />


                        <input
                            type="text"
                            placeholder="Buscar professor, sala, tipo..."
                            value={busca}
                            onChange={(event) =>
                                setBusca(
                                    event.target.value
                                )
                            }
                        />


                        {busca && (

                            <button
                                type="button"
                                className="busca-limpar"
                                onClick={() =>
                                    setBusca("")
                                }
                                title="Limpar busca"
                            >

                                <X size={15} />

                            </button>

                        )}

                    </div>


                    <select
                        className="ocorrencias-filtro-status"
                        value={filtroStatus}
                        onChange={(event) =>
                            setFiltroStatus(
                                event.target.value
                            )
                        }
                    >

                        <option value="todos">
                            Todos os status
                        </option>

                        <option value="ABERTA">
                            Em aberto
                        </option>

                        <option value="EM_ANDAMENTO">
                            Em andamento
                        </option>

                        <option value="RESOLVIDA">
                            Resolvidas
                        </option>

                    </select>

                </div>


                {/* =================================================
                    RESULTADO
                ================================================= */}

                {!carregando && (

                    <div className="resultado-filtro">

                        <span>

                            {ocorrenciasFiltradas.length}

                            {" "}

                            {ocorrenciasFiltradas.length === 1
                                ? "ocorrência encontrada"
                                : "ocorrências encontradas"
                            }

                        </span>

                    </div>

                )}


                {/* =================================================
                    TABELA
                ================================================= */}

                <div className="tabela-container">

                    <table className="tabela">


                        <thead>

                            <tr>

                                <th>
                                    Professor
                                </th>

                                <th>
                                    Sala
                                </th>

                                <th>
                                    Tipo
                                </th>

                                <th>
                                    Descrição
                                </th>

                                <th>
                                    Data
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


                            {carregando ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="tabela-vazia"
                                    >

                                        <div className="estado-carregando">

                                            <RefreshCw
                                                size={20}
                                                className="icone-carregando"
                                            />

                                            <span>
                                                Carregando ocorrências...
                                            </span>

                                        </div>

                                    </td>

                                </tr>


                            ) : ocorrenciasFiltradas.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="tabela-vazia"
                                    >

                                        <div className="estado-vazio">

                                            <div className="estado-vazio-icone">

                                                <ClipboardList
                                                    size={24}
                                                />

                                            </div>


                                            <strong>
                                                Nenhuma ocorrência encontrada
                                            </strong>


                                            <span>

                                                {busca ||
                                                filtroStatus !== "todos"

                                                    ? "Tente alterar os filtros de busca."

                                                    : "As ocorrências registradas aparecerão aqui."
                                                }

                                            </span>

                                        </div>

                                    </td>

                                </tr>


                            ) : (

                                ocorrenciasFiltradas.map(
                                    (ocorrencia) => (

                                        <tr
                                            key={ocorrencia.id}
                                        >


                                            {/* PROFESSOR */}

                                            <td>

                                                <div className="professor-celula">

                                                    <strong>

                                                        {
                                                            ocorrencia.professor ||
                                                            ocorrencia.professor_nome ||
                                                            "-"
                                                        }

                                                    </strong>

                                                </div>

                                            </td>


                                            {/* SALA */}

                                            <td>

                                                <span className="texto-sala">

                                                    {
                                                        ocorrencia.sala ||
                                                        "-"
                                                    }

                                                </span>

                                            </td>


                                            {/* TIPO */}

                                            <td>

                                                <span className="tipo-ocorrencia">

                                                    {
                                                        ocorrencia.tipo ||
                                                        "-"
                                                    }

                                                </span>

                                            </td>


                                            {/* DESCRIÇÃO */}

                                            <td>

                                                <div
                                                    className="ocorrencia-descricao"
                                                    title={
                                                        ocorrencia.descricao
                                                    }
                                                >

                                                    {
                                                        ocorrencia.descricao ||
                                                        "-"
                                                    }

                                                </div>

                                            </td>


                                            {/* DATA */}

                                            <td>

                                                <span className="data-ocorrencia">

                                                    {ocorrencia.data_abertura

                                                        ? new Date(
                                                            ocorrencia.data_abertura
                                                        ).toLocaleString(
                                                            "pt-BR",
                                                            {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            }
                                                        )

                                                        : "-"
                                                    }

                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                {mostrarStatus(
                                                    ocorrencia.status
                                                )}

                                            </td>


                                            {/* AÇÕES */}

                                            <td>

                                                <div className="acoes-ocorrencia">


                                                    <button
                                                        type="button"
                                                        className="botao-acao botao-status"
                                                        onClick={() =>
                                                            abrirModalStatus(
                                                                ocorrencia
                                                            )
                                                        }
                                                        title="Alterar status"
                                                    >

                                                        <Pencil size={15} />

                                                        <span>
                                                            Status
                                                        </span>

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="botao-acao botao-excluir"
                                                        disabled={
                                                            excluindoId ===
                                                            ocorrencia.id
                                                        }
                                                        onClick={() =>
                                                            excluirOcorrencia(
                                                                ocorrencia.id
                                                            )
                                                        }
                                                        title="Excluir ocorrência"
                                                    >

                                                        {excluindoId ===
                                                        ocorrencia.id ? (

                                                            <RefreshCw
                                                                size={15}
                                                                className="icone-carregando"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={15}
                                                            />

                                                        )}

                                                        <span>
                                                            Excluir
                                                        </span>

                                                    </button>


                                                </div>

                                            </td>


                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                MODAL NOVA OCORRÊNCIA
            ================================================= */}

            {modalAberto && (

                <div
                    className="modal-fundo"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            fecharModal()

                        }

                    }}
                >


                    <div
                        className="modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <div className="modal-cabecalho">

                            <div>

                                <span className="modal-overline">
                                    NOVO ATENDIMENTO
                                </span>

                                <h2>
                                    Registrar ocorrência
                                </h2>

                                <p>
                                    Informe os dados do problema
                                    encontrado.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-fechar"
                                onClick={fecharModal}
                                title="Fechar"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        <form
                            className="formulario"
                            onSubmit={registrarOcorrencia}
                        >


                            {erroFormulario && (

                                <div className="modal-erro">

                                    <AlertTriangle size={16} />

                                    <span>
                                        {erroFormulario}
                                    </span>

                                </div>

                            )}


                            {/* PROFESSOR */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="professor"
                                >

                                    Professor

                                    <span>
                                        *
                                    </span>

                                </label>


                                <select
                                    id="professor"
                                    className="campo-input"
                                    value={professorSelecionado}
                                    onChange={(event) =>
                                        setProfessorSelecionado(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Selecione o professor
                                    </option>


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


                            {/* SALA */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="sala"
                                >

                                    Sala

                                    <span>
                                        *
                                    </span>

                                </label>


                                <input
                                    id="sala"
                                    className="campo-input"
                                    type="text"
                                    placeholder="Ex.: Laboratório 01"
                                    value={sala}
                                    onChange={(event) =>
                                        setSala(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* TIPO */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="tipo"
                                >

                                    Tipo do problema

                                    <span>
                                        *
                                    </span>

                                </label>


                                <select
                                    id="tipo"
                                    className="campo-input"
                                    value={tipo}
                                    onChange={(event) =>
                                        setTipo(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Selecione o tipo
                                    </option>

                                    <option value="Chromebook">
                                        Chromebook
                                    </option>

                                    <option value="Rede">
                                        Rede
                                    </option>

                                    <option value="Internet">
                                        Internet
                                    </option>

                                    <option value="Sistema">
                                        Sistema
                                    </option>

                                    <option value="Hardware">
                                        Hardware
                                    </option>

                                    <option value="Outro">
                                        Outro
                                    </option>

                                </select>

                            </div>


                            {/* DESCRIÇÃO */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="descricao"
                                >

                                    Descrição

                                    <span>
                                        *
                                    </span>

                                </label>


                                <textarea
                                    id="descricao"
                                    className="campo-input campo-textarea"
                                    placeholder="Descreva o problema encontrado..."
                                    value={descricao}
                                    onChange={(event) =>
                                        setDescricao(
                                            event.target.value
                                        )
                                    }
                                    rows="4"
                                />


                                <span className="campo-ajuda">

                                    Descreva o problema de forma
                                    objetiva para facilitar o atendimento.

                                </span>

                            </div>


                            {/* AÇÕES */}

                            <div className="modal-acoes">


                                <button
                                    type="button"
                                    className="botao-secundario"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                >

                                    Cancelar

                                </button>


                                <button
                                    type="submit"
                                    className="botao botao-principal"
                                    disabled={salvando}
                                >

                                    {salvando ? (

                                        <>

                                            <RefreshCw
                                                size={16}
                                                className="icone-carregando"
                                            />

                                            Salvando...

                                        </>

                                    ) : (

                                        <>

                                            <Check size={16} />

                                            Registrar ocorrência

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                MODAL ALTERAR STATUS
            ================================================= */}

            {modalStatusAberto && (

                <div
                    className="modal-fundo"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            fecharModalStatus()

                        }

                    }}
                >


                    <div
                        className="modal modal-status"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <div className="modal-cabecalho">

                            <div>

                                <span className="modal-overline">
                                    GERENCIAR OCORRÊNCIA
                                </span>

                                <h2>
                                    Alterar status
                                </h2>

                                <p>
                                    Escolha o novo status para esta ocorrência.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-fechar"
                                onClick={fecharModalStatus}
                                title="Fechar"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        <div className="formulario">


                            {ocorrenciaSelecionada && (

                                <div className="resumo-status">

                                    <span>
                                        Ocorrência #{ocorrenciaSelecionada.id}
                                    </span>

                                    <strong>
                                        {
                                            ocorrenciaSelecionada.descricao ||
                                            "Sem descrição"
                                        }
                                    </strong>

                                </div>

                            )}


                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="novo-status"
                                >

                                    Novo status

                                </label>


                                <select
                                    id="novo-status"
                                    className="campo-input"
                                    value={novoStatus}
                                    onChange={(event) =>
                                        setNovoStatus(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="ABERTA">
                                        Aberta
                                    </option>

                                    <option value="EM_ANDAMENTO">
                                        Em andamento
                                    </option>

                                    <option value="RESOLVIDA">
                                        Resolvida
                                    </option>

                                </select>

                            </div>


                            <div className="modal-acoes">


                                <button
                                    type="button"
                                    className="botao-secundario"
                                    onClick={fecharModalStatus}
                                    disabled={salvandoStatus}
                                >

                                    Cancelar

                                </button>


                                <button
                                    type="button"
                                    className="botao botao-principal"
                                    onClick={alterarStatus}
                                    disabled={salvandoStatus}
                                >

                                    {salvandoStatus ? (

                                        <>

                                            <RefreshCw
                                                size={16}
                                                className="icone-carregando"
                                            />

                                            Salvando...

                                        </>

                                    ) : (

                                        <>

                                            <Save size={16} />

                                            Salvar status

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}


export default Ocorrencias