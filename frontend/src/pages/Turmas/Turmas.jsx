import { useEffect, useState } from "react"
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react"
import api from "../../services/api"
import "./Turmas.css"

function Turmas() {
    const [turmas, setTurmas] = useState([])
    const [busca, setBusca] = useState("")

    const [modalAberto, setModalAberto] = useState(false)
    const [nome, setNome] = useState("")
    const [turmaEditando, setTurmaEditando] = useState(null)

    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState("")

    useEffect(() => {
        carregarTurmas()
    }, [])

    // Busca as turmas cadastradas no banco
    async function carregarTurmas() {
        console.log("================================")
        console.log("[Turmas] Carregando turmas...")
        console.log("================================")

        try {
            setCarregando(true)
            setErro("")

            const resposta = await api.get("/turmas")

            console.log("[Turmas] Resposta da API:", resposta.data)

            const dados = resposta.data

            // O backend pode devolver a lista dentro de "turmas"
            const lista = Array.isArray(dados)
                ? dados
                : dados.turmas || dados.dados || []

            console.log("[Turmas] Lista recebida:", lista)

            setTurmas(lista)

            console.log(
                "[Turmas] Total de turmas:",
                lista.length
            )
        } catch (error) {
            console.error("================================")
            console.error("[Turmas] ERRO AO CARREGAR")
            console.error("[Turmas] Mensagem:", error.message)
            console.error("[Turmas] Status:", error.response?.status)
            console.error(
                "[Turmas] Resposta:",
                error.response?.data
            )
            console.error("================================")

            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível carregar as turmas."
            )
        } finally {
            setCarregando(false)
        }
    }

    // Abre o modal para cadastrar uma nova turma
    function abrirCadastro() {
        setTurmaEditando(null)
        setNome("")
        setErro("")
        setModalAberto(true)

        console.log("[Turmas] Abrindo cadastro.")
    }

    // Abre o modal preenchido para editar
    function abrirEdicao(turma) {
        setTurmaEditando(turma)
        setNome(turma.nome)
        setErro("")
        setModalAberto(true)

        console.log("[Turmas] Editando turma:", turma)
    }

    function fecharModal() {
        setModalAberto(false)
        setTurmaEditando(null)
        setNome("")
        setErro("")
    }

    // Salva uma turma nova ou atualiza uma existente
    async function salvarTurma(event) {
        event.preventDefault()

        const nomeLimpo = nome.trim()

        if (!nomeLimpo) {
            setErro("Digite o nome da turma.")
            return
        }

        console.log("================================")
        console.log("[Turmas] Salvando turma...")
        console.log("[Turmas] Nome:", nomeLimpo)
        console.log(
            "[Turmas] Modo:",
            turmaEditando ? "Edição" : "Cadastro"
        )
        console.log("================================")

        try {
            setSalvando(true)
            setErro("")

            let resposta

            if (turmaEditando) {
                resposta = await api.put(
                    `/turmas/${turmaEditando.id}`,
                    {
                        nome: nomeLimpo
                    }
                )
            } else {
                resposta = await api.post("/turmas", {
                    nome: nomeLimpo
                })
            }

            console.log(
                "[Turmas] Turma salva:",
                resposta.data
            )

            fecharModal()
            await carregarTurmas()
        } catch (error) {
            console.error("================================")
            console.error("[Turmas] ERRO AO SALVAR")
            console.error("[Turmas] Mensagem:", error.message)
            console.error("[Turmas] Status:", error.response?.status)
            console.error(
                "[Turmas] Resposta:",
                error.response?.data
            )
            console.error("================================")

            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível salvar a turma."
            )
        } finally {
            setSalvando(false)
        }
    }

    // Exclui uma turma
    async function excluirTurma(turma) {
        console.log("[Turmas] Tentando excluir:", turma)

        const confirmar = window.confirm(
            `Tem certeza que deseja excluir a turma "${turma.nome}"?`
        )

        if (!confirmar) {
            console.log("[Turmas] Exclusão cancelada.")
            return
        }

        try {
            console.log(
                "[Turmas] Excluindo turma ID:",
                turma.id
            )

            const resposta = await api.delete(
                `/turmas/${turma.id}`
            )

            console.log(
                "[Turmas] Turma excluída:",
                resposta.data
            )

            await carregarTurmas()
        } catch (error) {
            console.error("================================")
            console.error("[Turmas] ERRO AO EXCLUIR")
            console.error("[Turmas] Mensagem:", error.message)
            console.error("[Turmas] Status:", error.response?.status)
            console.error(
                "[Turmas] Resposta:",
                error.response?.data
            )
            console.error("================================")

            alert(
                error.response?.data?.mensagem ||
                "Não foi possível excluir a turma."
            )
        }
    }

    const turmasFiltradas = turmas.filter((turma) =>
        turma.nome
            ?.toLowerCase()
            .includes(busca.toLowerCase())
    )

    return (
        <section className="pagina-turmas">

            <div className="pagina-cabecalho">
                <div>
                    <h1>Turmas</h1>
                    <p>
                        Cadastre e gerencie as turmas que utilizam os Chromebooks.
                    </p>
                </div>

                <button
                    type="button"
                    className="botao-principal"
                    onClick={abrirCadastro}
                >
                    <Plus size={18} />
                    Nova turma
                </button>
            </div>

            <div className="turmas-resumo">
                <div className="turmas-resumo-icone">
                    <Users size={22} />
                </div>

                <div>
                    <span>Total de turmas</span>
                    <strong>{turmas.length}</strong>
                </div>
            </div>

            <div className="painel-turmas">

                <div className="painel-topo">
                    <div>
                        <h2>Turmas cadastradas</h2>
                        <span>
                            {turmasFiltradas.length} resultado(s)
                        </span>
                    </div>

                    <div className="campo-pesquisa">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Pesquisar turma..."
                            value={busca}
                            onChange={(event) =>
                                setBusca(event.target.value)
                            }
                        />
                    </div>
                </div>

                {carregando ? (
                    <div className="estado-turmas">
                        <p>Carregando turmas...</p>
                    </div>
                ) : erro ? (
                    <div className="estado-turmas estado-erro">
                        <p>{erro}</p>

                        <button
                            type="button"
                            onClick={carregarTurmas}
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : turmasFiltradas.length === 0 ? (
                    <div className="estado-turmas">
                        <Users size={32} />

                        <h3>
                            {busca
                                ? "Nenhuma turma encontrada"
                                : "Nenhuma turma cadastrada"}
                        </h3>

                        <p>
                            {busca
                                ? "Tente pesquisar por outro nome."
                                : "Cadastre a primeira turma para começar."}
                        </p>
                    </div>
                ) : (
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Turma</th>
                                    <th className="coluna-acoes">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {turmasFiltradas.map((turma) => (
                                    <tr key={turma.id}>
                                        <td>#{turma.id}</td>

                                        <td>
                                            <strong>
                                                {turma.nome}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="acoes-tabela">

                                                <button
                                                    type="button"
                                                    className="botao-acao botao-editar"
                                                    title="Editar turma"
                                                    onClick={() =>
                                                        abrirEdicao(turma)
                                                    }
                                                >
                                                    <Pencil size={17} />
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="botao-acao botao-excluir"
                                                    title="Excluir turma"
                                                    onClick={() =>
                                                        excluirTurma(turma)
                                                    }
                                                >
                                                    <Trash2 size={17} />
                                                    Excluir
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {modalAberto && (
                <div
                    className="modal-fundo"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            fecharModal()
                        }
                    }}
                >
                    <div className="modal">

                        <div className="modal-cabecalho">
                            <div>
                                <h2>
                                    {turmaEditando
                                        ? "Editar turma"
                                        : "Nova turma"}
                                </h2>

                                <p>
                                    {turmaEditando
                                        ? "Altere os dados da turma."
                                        : "Cadastre uma nova turma no sistema."}
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

                        <form onSubmit={salvarTurma}>

                            <div className="campo-formulario">
                                <label htmlFor="nome-turma">
                                    Nome da turma
                                </label>

                                <input
                                    id="nome-turma"
                                    type="text"
                                    placeholder="Ex.: 3º ADS"
                                    value={nome}
                                    onChange={(event) =>
                                        setNome(event.target.value)
                                    }
                                    autoFocus
                                />
                            </div>

                            {erro && (
                                <div className="mensagem-erro">
                                    {erro}
                                </div>
                            )}

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
                                    className="botao-principal"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : turmaEditando
                                            ? "Salvar alterações"
                                            : "Cadastrar turma"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

        </section>
    )
}

export default Turmas