import { useEffect, useState } from "react"
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Users
} from "lucide-react"

import api from "../../services/api"
import "./Professores.css"

function Professores() {
    // Lista de professores que vem do banco
    const [professores, setProfessores] = useState([])

    // Campo de pesquisa
    const [busca, setBusca] = useState("")

    // Controle do modal
    const [modalAberto, setModalAberto] = useState(false)

    // Campos do formulário
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")

    // Quando estiver editando, guardamos o ID
    const [professorEditando, setProfessorEditando] = useState(null)

    // Estados de carregamento e mensagens
    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState("")
    const [erroFormulario, setErroFormulario] = useState("")

    // Carrega os professores quando abrir a página
    useEffect(() => {
        carregarProfessores()
    }, [])

    // =========================================================
    // BUSCA OS PROFESSORES
    // =========================================================

    async function carregarProfessores() {
        console.log("================================")
        console.log("[Professores] Carregando professores...")
        console.log("================================")

        try {
            setCarregando(true)
            setErro("")

            const resposta = await api.get("/professores")

            console.log(
                "[Professores] Resposta da API:",
                resposta.data
            )

            const dados = resposta.data

            // Nossa API pode devolver os dados diretamente
            // ou dentro de "dados"
            const lista = Array.isArray(dados)
                ? dados
                : dados.professores || []

            setProfessores(lista)

            console.log(
                "[Professores] Professores carregados:",
                lista
            )
        } catch (error) {
            console.error("================================")
            console.error(
                "[Professores] ERRO AO CARREGAR"
            )
            console.error(
                "[Professores] Mensagem:",
                error.message
            )
            console.error(
                "[Professores] Status:",
                error.response?.status
            )
            console.error(
                "[Professores] Resposta:",
                error.response?.data
            )
            console.error(
                "[Professores] URL:",
                error.config?.url
            )
            console.error("================================")

            setErro(
                "Não foi possível carregar os professores."
            )
        } finally {
            setCarregando(false)
        }
    }

    // =========================================================
    // ABRE MODAL PARA NOVO PROFESSOR
    // =========================================================

    function abrirNovoProfessor() {
        console.log(
            "[Professores] Abrindo cadastro de professor."
        )

        setProfessorEditando(null)
        setNome("")
        setEmail("")
        setErroFormulario("")
        setModalAberto(true)
    }

    // =========================================================
    // ABRE MODAL PARA EDITAR
    // =========================================================

    function abrirEdicao(professor) {
        console.log(
            "[Professores] Editando professor:",
            professor
        )

        setProfessorEditando(professor.id)
        setNome(professor.nome || "")
        setEmail(professor.email || "")
        setErroFormulario("")
        setModalAberto(true)
    }

    // =========================================================
    // FECHA MODAL
    // =========================================================

    function fecharModal() {
        if (salvando) {
            return
        }

        setModalAberto(false)
        setNome("")
        setEmail("")
        setProfessorEditando(null)
        setErroFormulario("")
    }

    // =========================================================
    // SALVA PROFESSOR
    // =========================================================

    async function salvarProfessor(evento) {
        evento.preventDefault()

        console.log("================================")
        console.log("[Professores] Salvando professor...")
        console.log("[Professores] Nome:", nome)
        console.log("[Professores] E-mail:", email)
        console.log("================================")

        setErroFormulario("")

        // Validação simples antes de mandar para o backend
        if (!nome.trim()) {
            setErroFormulario(
                "Informe o nome do professor."
            )
            return
        }

        if (!email.trim()) {
            setErroFormulario(
                "Informe o e-mail do professor."
            )
            return
        }

        try {
            setSalvando(true)

            let resposta

            // Se tiver ID, estamos editando
            if (professorEditando) {
                console.log(
                    "[Professores] Atualizando professor:",
                    professorEditando
                )

                resposta = await api.put(
                    `/professores/${professorEditando}`,
                    {
                        nome: nome.trim(),
                        email: email.trim()
                    }
                )
            } else {
                // Se não tiver ID, é um novo cadastro
                console.log(
                    "[Professores] Criando novo professor..."
                )

                resposta = await api.post(
                    "/professores",
                    {
                        nome: nome.trim(),
                        email: email.trim()
                    }
                )
            }

            console.log(
                "[Professores] Professor salvo:",
                resposta.data
            )

            // Fecha o modal
            fecharModal()

            // Atualiza a lista
            await carregarProfessores()
        } catch (error) {
            console.error("================================")
            console.error(
                "[Professores] ERRO AO SALVAR"
            )
            console.error(
                "[Professores] Mensagem:",
                error.message
            )
            console.error(
                "[Professores] Status:",
                error.response?.status
            )
            console.error(
                "[Professores] Resposta:",
                error.response?.data
            )
            console.error(
                "[Professores] URL:",
                error.config?.url
            )
            console.error("================================")

            setErroFormulario(
                error.response?.data?.mensagem ||
                "Não foi possível salvar o professor."
            )
        } finally {
            setSalvando(false)
        }
    }

    // =========================================================
    // EXCLUI PROFESSOR
    // =========================================================

    async function excluirProfessor(id) {
        console.log(
            "[Professores] Tentando excluir professor:",
            id
        )

        const confirmar = window.confirm(
            "Tem certeza que deseja excluir este professor?"
        )

        if (!confirmar) {
            console.log(
                "[Professores] Exclusão cancelada."
            )
            return
        }

        try {
            console.log(
                "[Professores] Enviando exclusão para a API..."
            )

            const resposta = await api.delete(
                `/professores/${id}`
            )

            console.log(
                "[Professores] Professor excluído:",
                resposta.data
            )

            await carregarProfessores()
        } catch (error) {
            console.error("================================")
            console.error(
                "[Professores] ERRO AO EXCLUIR"
            )
            console.error(
                "[Professores] Mensagem:",
                error.message
            )
            console.error(
                "[Professores] Status:",
                error.response?.status
            )
            console.error(
                "[Professores] Resposta:",
                error.response?.data
            )
            console.error("================================")

            alert(
                error.response?.data?.mensagem ||
                "Não foi possível excluir o professor."
            )
        }
    }

    // =========================================================
    // FILTRO
    // =========================================================

    const professoresFiltrados = professores.filter(
        (professor) => {
            const texto = busca.toLowerCase()

            return (
                professor.nome
                    ?.toLowerCase()
                    .includes(texto) ||
                professor.email
                    ?.toLowerCase()
                    .includes(texto)
            )
        }
    )

    // =========================================================
    // CARREGANDO
    // =========================================================

    if (carregando) {
        return (
            <section className="professores">
                <div className="professores-carregando">
                    Carregando professores...
                </div>
            </section>
        )
    }

    // =========================================================
    // ERRO
    // =========================================================

    if (erro) {
        return (
            <section className="professores">
                <div className="professores-erro">
                    {erro}
                </div>
            </section>
        )
    }

    // =========================================================
    // TELA PRINCIPAL
    // =========================================================

    return (
        <section className="professores">

            {/* Cabeçalho */}
            <header className="cabecalho">
                <div>
                    <h1 className="titulo">
                        Professores
                    </h1>

                    <p className="subtitulo">
                        Cadastre e gerencie os professores do sistema.
                    </p>
                </div>

                <button
                    type="button"
                    className="botao botao-principal"
                    onClick={abrirNovoProfessor}
                >
                    <Plus size={18} />
                    Novo professor
                </button>
            </header>

            {/* Resumo */}
            <div className="professores-resumo">

                <div className="professor-resumo-icone">
                    <Users size={21} />
                </div>

                <div>
                    <span>
                        Professores cadastrados
                    </span>

                    <strong>
                        {professores.length}
                    </strong>
                </div>

            </div>

            {/* Painel */}
            <div className="painel">

                <div className="painel-cabecalho">

                    <div>
                        <h2 className="painel-titulo">
                            Lista de professores
                        </h2>

                        <p className="painel-descricao">
                            Professores disponíveis para empréstimos.
                        </p>
                    </div>

                    {/* Pesquisa */}
                    <div className="campo-busca">
                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Pesquisar professor..."
                            value={busca}
                            onChange={(evento) =>
                                setBusca(
                                    evento.target.value
                                )
                            }
                        />
                    </div>

                </div>

                {/* Tabela */}
                <div className="tabela-container">

                    <table className="tabela">

                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>

                            {professoresFiltrados.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="tabela-vazia"
                                    >
                                        Nenhum professor encontrado.
                                    </td>
                                </tr>
                            ) : (
                                professoresFiltrados.map(
                                    (professor) => (
                                        <tr
                                            key={professor.id}
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        professor.nome
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    professor.email
                                                }
                                            </td>

                                            <td>
                                                <div className="acoes">

                                                    <button
                                                        type="button"
                                                        className="botao-acao botao-editar"
                                                        title="Editar professor"
                                                        onClick={() =>
                                                            abrirEdicao(
                                                                professor
                                                            )
                                                        }
                                                    >
                                                        <Pencil
                                                            size={17}
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="botao-acao botao-excluir"
                                                        title="Excluir professor"
                                                        onClick={() =>
                                                            excluirProfessor(
                                                                professor.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            size={17}
                                                        />
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

            </div>

            {/* Modal */}
            {modalAberto && (
                <div
                    className="modal-fundo"
                    onClick={fecharModal}
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
                                    {professorEditando
                                        ? "Editar professor"
                                        : "Novo professor"}
                                </h2>

                                <p>
                                    {professorEditando
                                        ? "Atualize os dados do professor."
                                        : "Cadastre um novo professor no sistema."}
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

                        <form
                            className="formulario"
                            onSubmit={salvarProfessor}
                        >

                            {/* Nome */}
                            <div className="campo">

                                <label className="campo-label">
                                    Nome
                                </label>

                                <input
                                    className="campo-input"
                                    type="text"
                                    placeholder="Nome completo"
                                    value={nome}
                                    onChange={(evento) =>
                                        setNome(
                                            evento.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* E-mail */}
                            <div className="campo">

                                <label className="campo-label">
                                    E-mail
                                </label>

                                <input
                                    className="campo-input"
                                    type="email"
                                    placeholder="professor@escola.com"
                                    value={email}
                                    onChange={(evento) =>
                                        setEmail(
                                            evento.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* Erro */}
                            {erroFormulario && (
                                <div className="modal-erro">
                                    {erroFormulario}
                                </div>
                            )}

                            {/* Ações */}
                            <div className="modal-acoes">

                                <button
                                    type="button"
                                    className="botao botao-secundario"
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
                                    {salvando
                                        ? "Salvando..."
                                        : professorEditando
                                            ? "Salvar alterações"
                                            : "Cadastrar professor"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </section>
    )
}

export default Professores