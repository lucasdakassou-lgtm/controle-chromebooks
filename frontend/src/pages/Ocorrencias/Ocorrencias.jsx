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
    // DADOS DA PÁGINA
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

    const [professorSelecionado, setProfessorSelecionado] = useState("")
    const [sala, setSala] = useState("")
    const [dataAbertura, setDataAbertura] = useState("")
    const [tipo, setTipo] = useState("")
    const [descricao, setDescricao] = useState("")


    // =========================================================
    // MODAL DE ALTERAÇÃO DE STATUS
    // =========================================================

    const [modalStatusAberto, setModalStatusAberto] = useState(false)
    const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState(null)
    const [novoStatus, setNovoStatus] = useState("")
    const [salvandoStatus, setSalvandoStatus] = useState(false)


    // =========================================================
    // EXCLUSÃO
    // =========================================================

    const [excluindoId, setExcluindoId] = useState(null)


    // =========================================================
    // CARREGAR OCORRÊNCIAS
    // =========================================================

    async function carregarOcorrencias() {

        try {

            setCarregando(true)
            setErro("")

            const resposta = await api.get("/ocorrencias")

            const dados = resposta.data

            setOcorrencias(
                dados.ocorrencias ||
                dados.dados ||
                []
            )

        } catch (error) {

            console.error("[OCORRENCIAS] Erro ao carregar:", error)

            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível carregar as ocorrências."
            )

        } finally {

            setCarregando(false)

        }
    }


    // =========================================================
    // CARREGAR PROFESSORES
    // =========================================================

    async function carregarProfessores() {

        try {

            const resposta = await api.get("/professores")

            const dados = resposta.data

            setProfessores(
                dados.professores ||
                dados.dados ||
                dados ||
                []
            )

        } catch (error) {

            console.error("[OCORRENCIAS] Erro ao carregar professores:", error)

        }
    }


    // =========================================================
    // CARREGAMENTO INICIAL
    // =========================================================

    useEffect(() => {

        carregarOcorrencias()
        carregarProfessores()

    }, [])


    // =========================================================
    // DATA DE HOJE
    // =========================================================

    function obterDataAtual() {

        const hoje = new Date()

        const ano = hoje.getFullYear()
        const mes = String(hoje.getMonth() + 1).padStart(2, "0")
        const dia = String(hoje.getDate()).padStart(2, "0")

        return `${ano}-${mes}-${dia}`
    }


    // =========================================================
    // ABRIR MODAL
    // =========================================================

    function abrirModal() {

        setProfessorSelecionado("")
        setSala("")
        setDataAbertura(obterDataAtual())
        setTipo("")
        setDescricao("")

        setErroFormulario("")
        setMensagemSucesso("")

        setModalAberto(true)
    }


    // =========================================================
    // FECHAR MODAL
    // =========================================================

    function fecharModal() {

        if (salvando) {
            return
        }

        setModalAberto(false)

        setProfessorSelecionado("")
        setSala("")
        setDataAbertura("")
        setTipo("")
        setDescricao("")

        setErroFormulario("")
    }


    // =========================================================
    // REGISTRAR OCORRÊNCIA
    // =========================================================

    async function registrarOcorrencia(event) {

        event.preventDefault()

        setErroFormulario("")
        setMensagemSucesso("")


        // ---------------------------------------------
        // VALIDAÇÕES DO FORMULÁRIO
        // ---------------------------------------------

        if (!professorSelecionado) {

            setErroFormulario(
                "Selecione o professor responsável pela ocorrência."
            )

            return
        }

        if (!sala.trim()) {

            setErroFormulario(
                "Informe a sala da ocorrência."
            )

            return
        }

        if (!dataAbertura) {

            setErroFormulario(
                "Informe a data da ocorrência."
            )

            return
        }

        if (!tipo.trim()) {

            setErroFormulario(
                "Informe o tipo do problema."
            )

            return
        }

        if (!descricao.trim()) {

            setErroFormulario(
                "Informe a descrição da ocorrência."
            )

            return
        }


        // ---------------------------------------------
        // DADOS ENVIADOS PARA A API
        // ---------------------------------------------

        const dados = {

            professor_id: Number(professorSelecionado),

            sala: sala.trim(),

            data_abertura: dataAbertura,

            tipo: tipo.trim(),

            descricao: descricao.trim()
        }


        try {

            setSalvando(true)

            await api.post("/ocorrencias", dados)

            console.log(
                "[OCORRENCIAS] Ocorrência registrada com sucesso."
            )


            // Atualiza a tabela depois de cadastrar
            await carregarOcorrencias()


            setMensagemSucesso(
                "Ocorrência registrada com sucesso."
            )

            fecharModal()


        } catch (error) {

            console.error(
                "[OCORRENCIAS] Erro ao registrar:",
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

        setOcorrenciaSelecionada(ocorrencia)

        setNovoStatus(
            ocorrencia.status || "ABERTA"
        )

        setModalStatusAberto(true)
    }


    // =========================================================
    // FECHAR MODAL DE STATUS
    // =========================================================

    function fecharModalStatus() {

        if (salvandoStatus) {
            return
        }

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

        if (!novoStatus) {
            return
        }

        try {

            setSalvandoStatus(true)

            await api.put(
                `/ocorrencias/${ocorrenciaSelecionada.id}`,
                {
                    status: novoStatus
                }
            )

            console.log(
                "[OCORRENCIAS] Status atualizado."
            )

            await carregarOcorrencias()

            setMensagemSucesso(
                "Status atualizado com sucesso."
            )

            fecharModalStatus()

        } catch (error) {

            console.error(
                "[OCORRENCIAS] Erro ao alterar status:",
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
            return
        }

        try {

            setExcluindoId(id)

            await api.delete(`/ocorrencias/${id}`)

            console.log(
                "[OCORRENCIAS] Ocorrência excluída."
            )

            await carregarOcorrencias()

            setMensagemSucesso(
                "Ocorrência excluída com sucesso."
            )

        } catch (error) {

            console.error(
                "[OCORRENCIAS] Erro ao excluir:",
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
    // FILTRO DAS OCORRÊNCIAS
    // =========================================================

    const ocorrenciasFiltradas = useMemo(() => {

        return ocorrencias.filter((ocorrencia) => {

            const textoBusca = busca
                .toLowerCase()
                .trim()

           const nomeProfessor =
    typeof ocorrencia.professor === "string"
        ? ocorrencia.professor
        : ocorrencia.professor?.nome ||
          ocorrencia.professor_nome ||
          "Não informado"

            const correspondeBusca =
                !textoBusca ||
                nomeProfessor.toLowerCase().includes(textoBusca) ||
                String(ocorrencia.sala || "")
                    .toLowerCase()
                    .includes(textoBusca) ||
                String(ocorrencia.tipo || "")
                    .toLowerCase()
                    .includes(textoBusca) ||
                String(ocorrencia.descricao || "")
                    .toLowerCase()
                    .includes(textoBusca)

            const statusOcorrencia =
                String(ocorrencia.status || "")
                    .toLowerCase()

            const correspondeStatus =
                filtroStatus === "todos" ||
                statusOcorrencia === filtroStatus.toLowerCase()

            return correspondeBusca && correspondeStatus
        })

    }, [ocorrencias, busca, filtroStatus])


    // =========================================================
    // RESUMO DOS STATUS
    // =========================================================

    const totalOcorrencias = ocorrencias.length

    const ocorrenciasAbertas = ocorrencias.filter(
        (ocorrencia) =>
            ocorrencia.status === "ABERTA"
    ).length

    const ocorrenciasAndamento = ocorrencias.filter(
        (ocorrencia) =>
            ocorrencia.status === "EM_ANDAMENTO"
    ).length

    const ocorrenciasResolvidas = ocorrencias.filter(
        (ocorrencia) =>
            ocorrencia.status === "RESOLVIDA"
    ).length


    // =========================================================
    // STATUS
    // =========================================================

    function textoStatus(status) {

        if (status === "ABERTA") {
            return "Aberta"
        }

        if (status === "EM_ANDAMENTO") {
            return "Em andamento"
        }

        if (status === "RESOLVIDA") {
            return "Resolvida"
        }

        return status || "-"
    }


    function classeStatus(status) {

        if (status === "ABERTA") {
            return "status-aberta"
        }

        if (status === "EM_ANDAMENTO") {
            return "status-andamento"
        }

        if (status === "RESOLVIDA") {
            return "status-resolvida"
        }

        return ""
    }


    // =========================================================
    // DATA FORMATADA
    // =========================================================

    function formatarData(data) {

        if (!data) {
            return "-"
        }

        const dataFormatada = new Date(data)

        if (Number.isNaN(dataFormatada.getTime())) {
            return "-"
        }

        return dataFormatada.toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",

            }
        )
    }


    // =========================================================
    // TELA
    // =========================================================

    return (

        <div className="ocorrencias">

            {/* =====================================================
                CABEÇALHO
            ====================================================== */}

            <div className="pagina-cabecalho">

                <div>

                    <h1>Ocorrências</h1>

                    <p>
                        Registre e acompanhe problemas atendidos pelo PROATI.
                    </p>

                </div>


                <div className="pagina-acoes">

                    <button
                        className="botao-secundario"
                        onClick={carregarOcorrencias}
                        disabled={carregando}
                    >
                        <RefreshCw size={18} />

                        Atualizar
                    </button>


                    <button
                        className="botao-principal"
                        onClick={abrirModal}
                    >
                        <Plus size={18} />

                        Nova ocorrência
                    </button>

                </div>

            </div>


            {/* =====================================================
                MENSAGEM DE SUCESSO
            ====================================================== */}

            {mensagemSucesso && (

                <div className="mensagem-sucesso">

                    <CheckCircle2 size={18} />

                    <span>
                        {mensagemSucesso}
                    </span>

                    <button
                        onClick={() => setMensagemSucesso("")}
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =====================================================
                ERRO GERAL
            ====================================================== */}

            {erro && (

                <div className="mensagem-erro">

                    <AlertTriangle size={18} />

                    <span>
                        {erro}
                    </span>

                    <button
                        onClick={() => setErro("")}
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =====================================================
                CARDS DE RESUMO
            ====================================================== */}

            <div className="cards-resumo">

                <div className="card-resumo">

                    <div className="card-resumo-icone">

                        <ClipboardList size={22} />

                    </div>

                    <span>
                        Total de ocorrências
                    </span>

                    <strong>
                        {totalOcorrencias}
                    </strong>

                </div>


                <div className="card-resumo">

                    <div className="card-resumo-icone">

                        <AlertTriangle size={22} />

                    </div>

                    <span>
                        Abertas
                    </span>

                    <strong>
                        {ocorrenciasAbertas}
                    </strong>

                </div>


                <div className="card-resumo">

                    <div className="card-resumo-icone">

                        <Clock3 size={22} />

                    </div>

                    <span>
                        Em andamento
                    </span>

                    <strong>
                        {ocorrenciasAndamento}
                    </strong>

                </div>


                <div className="card-resumo">

                    <div className="card-resumo-icone">

                        <CheckCircle2 size={22} />

                    </div>

                    <span>
                        Resolvidas
                    </span>

                    <strong>
                        {ocorrenciasResolvidas}
                    </strong>

                </div>

            </div>


            {/* =====================================================
                FILTROS
            ====================================================== */}

            <div className="filtros">

                <div className="campo-busca">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Buscar ocorrência..."
                        value={busca}
                        onChange={(event) =>
                            setBusca(event.target.value)
                        }
                    />

                </div>


                <select
                    className="filtro-status"
                    value={filtroStatus}
                    onChange={(event) =>
                        setFiltroStatus(event.target.value)
                    }
                >

                    <option value="todos">
                        Todos os status
                    </option>

                    <option value="aberta">
                        Abertas
                    </option>

                    <option value="em_andamento">
                        Em andamento
                    </option>

                    <option value="resolvida">
                        Resolvidas
                    </option>

                </select>

            </div>


            {/* =====================================================
                TABELA
            ====================================================== */}

            <div className="tabela-container">

                {carregando ? (

                    <div className="estado-tabela">

                        <RefreshCw
                            size={24}
                            className="icone-carregando"
                        />

                        <span>
                            Carregando ocorrências...
                        </span>

                    </div>

                ) : ocorrenciasFiltradas.length === 0 ? (

                    <div className="estado-tabela">

                        <ClipboardList size={28} />

                        <strong>
                            Nenhuma ocorrência encontrada.
                        </strong>

                        <span>
                            Tente alterar os filtros ou registre uma nova ocorrência.
                        </span>

                    </div>

                ) : (

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Data
                                </th>

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
                                    Status
                                </th>

                                <th>
                                    Ações
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {ocorrenciasFiltradas.map(
                                (ocorrencia) => {

                                  const nomeProfessor =
    typeof ocorrencia.professor === "string"
        ? ocorrencia.professor
        : ocorrencia.professor?.nome ||
          ocorrencia.professor_nome ||
          "Não informado"

                                    return (

                                        <tr
                                            key={ocorrencia.id}
                                        >

                                            <td>
                                                {formatarData(
                                                    ocorrencia.data_abertura
                                                )}
                                            </td>


                                            <td>
                                                {nomeProfessor}
                                            </td>


                                            <td>
                                                {ocorrencia.sala}
                                            </td>


                                            <td>
                                                {ocorrencia.tipo}
                                            </td>


                                            <td
                                                className="descricao-celula"
                                                title={ocorrencia.descricao}
                                            >
                                                {ocorrencia.descricao}
                                            </td>


                                            <td>

                                                <span
                                                    className={`status ${classeStatus(
                                                        ocorrencia.status
                                                    )}`}
                                                >
                                                    {textoStatus(
                                                        ocorrencia.status
                                                    )}
                                                </span>

                                            </td>


                                            <td>

                                                <div className="acoes-tabela">

                                                    <button
                                                        className="botao-acao"
                                                        title="Alterar status"
                                                        onClick={() =>
                                                            abrirModalStatus(
                                                                ocorrencia
                                                            )
                                                        }
                                                    >
                                                        <Pencil size={17} />
                                                    </button>


                                                    <button
                                                        className="botao-acao botao-excluir"
                                                        title="Excluir ocorrência"
                                                        onClick={() =>
                                                            excluirOcorrencia(
                                                                ocorrencia.id
                                                            )
                                                        }
                                                        disabled={
                                                            excluindoId ===
                                                            ocorrencia.id
                                                        }
                                                    >

                                                        {excluindoId ===
                                                        ocorrencia.id ? (

                                                            <RefreshCw
                                                                size={17}
                                                                className="icone-carregando"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={17}
                                                            />

                                                        )}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                }
                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {/* =====================================================
                MODAL - NOVA OCORRÊNCIA
            ====================================================== */}

            {modalAberto && (

                <div className="modal-overlay">

                    <div className="modal">

                        <div className="modal-cabecalho">

                            <div>

                                <h2>
                                    Nova ocorrência
                                </h2>

                                <p>
                                    Registre um problema atendido pelo PROATI.
                                </p>

                            </div>


                            <button
                                className="modal-fechar"
                                onClick={fecharModal}
                                disabled={salvando}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={registrarOcorrencia}
                        >

                            {/* =================================================
                                ERRO DO FORMULÁRIO
                            ================================================== */}

                            {erroFormulario && (

                                <div className="formulario-erro">

                                    <AlertTriangle size={17} />

                                    <span>
                                        {erroFormulario}
                                    </span>

                                </div>

                            )}


                            {/* =================================================
                                PROFESSOR
                            ================================================== */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="professor"
                                >
                                    Professor
                                    <span>*</span>
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
                                        Selecione um professor
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


                            {/* =================================================
                                SALA
                            ================================================== */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="sala"
                                >
                                    Sala
                                    <span>*</span>
                                </label>


                                <input
                                    id="sala"
                                    className="campo-input"
                                    type="text"
                                    placeholder="Ex.: Sala de Informática"
                                    value={sala}
                                    onChange={(event) =>
                                        setSala(event.target.value)
                                    }
                                />

                            </div>


                            {/* =================================================
                                DATA DA OCORRÊNCIA
                            ================================================== */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="data-abertura"
                                >
                                    Data da ocorrência
                                    <span>*</span>
                                </label>


                                <input
                                    id="data-abertura"
                                    className="campo-input"
                                    type="date"
                                    value={dataAbertura}
                                    onChange={(event) =>
                                        setDataAbertura(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* =================================================
                                TIPO DO PROBLEMA
                            ================================================== */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="tipo"
                                >
                                    Tipo do problema
                                    <span>*</span>
                                </label>


                                <select
                                    id="tipo"
                                    className="campo-input"
                                    value={tipo}
                                    onChange={(event) =>
                                        setTipo(event.target.value)
                                    }
                                >

                                    <option value="">
                                        Selecione o tipo
                                    </option>

                                    <option value="REDE">
                                        Rede
                                    </option>

                                    <option value="COMPUTADOR">
                                        Computador
                                    </option>

                                    <option value="PROJETOR">
                                        Projetor
                                    </option>

                                    <option value="IMPRESSORA">
                                        Impressora
                                    </option>
                                            <option value="MONITOR">
                                        Monitor
                                    </option>
                                            <option value="MOUSE/TECLADO">
                                            Mouse/Teclado
                                    </option>
                                     <option value="CAIXA DE SOM">
                                            Caixa de Som
                                    </option>
                                    
                                    


                                    <option value="OUTRO">
                                        Outro
                                    </option>

                                  

                                </select>

                            </div>


                            {/* =================================================
                                DESCRIÇÃO
                            ================================================== */}

                            <div className="campo">

                                <label
                                    className="campo-label"
                                    htmlFor="descricao"
                                >
                                    Descrição
                                    <span>*</span>
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
                                    rows={4}
                                />

                            </div>


                            {/* =================================================
                                BOTÕES
                            ================================================== */}

                            <div className="modal-acoes">

                                <button
                                    type="button"
                                    className="botao-secundario"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                >
                                    <X size={18} />

                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    className="botao-principal"
                                    disabled={salvando}
                                >

                                    {salvando ? (

                                        <>
                                            <RefreshCw
                                                size={18}
                                                className="icone-carregando"
                                            />

                                            Salvando...
                                        </>

                                    ) : (

                                        <>
                                            <Save size={18} />

                                            Registrar ocorrência
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                MODAL - ALTERAR STATUS
            ====================================================== */}

            {modalStatusAberto && ocorrenciaSelecionada && (

                <div className="modal-overlay">

                    <div className="modal modal-status">

                        <div className="modal-cabecalho">

                            <div>

                                <h2>
                                    Alterar status
                                </h2>

                                <p>
                                    Atualize o andamento da ocorrência.
                                </p>

                            </div>


                            <button
                                className="modal-fechar"
                                onClick={fecharModalStatus}
                                disabled={salvandoStatus}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <div className="status-info">

                            <strong>
                                Ocorrência #{ocorrenciaSelecionada.id}
                            </strong>

                            <span>
                                {ocorrenciaSelecionada.descricao}
                            </span>

                        </div>


                        <div className="campo">

                            <label
                                className="campo-label"
                                htmlFor="novo-status"
                            >
                                Status
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
                                <X size={18} />

                                Cancelar
                            </button>


                            <button
                                type="button"
                                className="botao-principal"
                                onClick={alterarStatus}
                                disabled={salvandoStatus}
                            >

                                {salvandoStatus ? (

                                    <>
                                        <RefreshCw
                                            size={18}
                                            className="icone-carregando"
                                        />

                                        Salvando...
                                    </>

                                ) : (

                                    <>
                                        <Check size={18} />

                                        Salvar status
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )
}


export default Ocorrencias