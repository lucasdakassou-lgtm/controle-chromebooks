import { useEffect, useState } from "react"
import {
    Laptop,
    LaptopMinimalCheck,
    LaptopMinimal,
    AlertTriangle,
    Users,
    TrendingUp,
    Activity
} from "lucide-react"

import api from "../../services/api"
import "./Dashboard.css"

function Dashboard() {
    const [resumo, setResumo] = useState(null)
    const [ranking, setRanking] = useState([])
    const [salas, setSalas] = useState([])

    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState("")

    useEffect(() => {
        carregarDashboard()
    }, [])

    async function carregarDashboard() {
        try {
            setCarregando(true)
            setErro("")

            const [resumoResposta, rankingResposta, salasResposta] =
                await Promise.all([
                    api.get("/relatorios/resumo"),
                    api.get("/relatorios/ranking-professores"),
                    api.get("/relatorios/ocorrencias-salas")
                ])

            setResumo(resumoResposta.data)
           console.log("[Dashboard] Tipo do ranking:", typeof rankingResposta.data)
console.log("[Dashboard] É array?", Array.isArray(rankingResposta.data))
console.log("[Dashboard] Conteúdo do ranking:", rankingResposta.data)

setRanking(
    Array.isArray(rankingResposta.data)
        ? rankingResposta.data
        : rankingResposta.data.ranking || rankingResposta.data.professores || []
)
           console.log("[Dashboard] Tipo das salas:", typeof salasResposta.data)
console.log("[Dashboard] É array?", Array.isArray(salasResposta.data))
console.log("[Dashboard] Conteúdo das salas:", salasResposta.data)

setSalas(
    Array.isArray(salasResposta.data)
        ? salasResposta.data
        : salasResposta.data.salas || []
)

        } catch (error) {
            console.error(error)
            setErro("Não foi possível carregar os dados do dashboard.")
        } finally {
            setCarregando(false)
        }
    }

    if (carregando) {
        return (
            <section className="dashboard">
                <div className="dashboard-carregando">
                    Carregando dashboard...
                </div>
            </section>
        )
    }

    if (erro) {
        return (
            <section className="dashboard">
                <div className="dashboard-erro">
                    <AlertTriangle size={22} />
                    <span>{erro}</span>
                </div>
            </section>
        )
    }

    return (
        <section className="dashboard">

            <header className="cabecalho">
                <div>
                    <h1 className="titulo">Dashboard</h1>
                    <p className="subtitulo">
                        Visão geral dos Chromebooks e atividades do PROATI.
                    </p>
                </div>

                <div className="cabecalho-status">
                    <Activity size={18} />
                    Sistema operacional
                </div>
            </header>

            <div className="cards">

                <div className="card">
                    <div className="card-topo">
                        <div className="card-icone card-icone-azul">
                            <Laptop size={21} />
                        </div>
                    </div>

                    <p className="card-titulo">
                        Total de Chromebooks
                    </p>

                    <strong className="card-numero">
                        {resumo?.total_chromebooks ?? 47}
                    </strong>

                    <span className="card-descricao">
                        Equipamentos cadastrados
                    </span>
                </div>

                <div className="card">
                    <div className="card-topo">
                        <div className="card-icone card-icone-roxo">
                            <LaptopMinimal size={21} />
                        </div>
                    </div>

                    <p className="card-titulo">
                        Chromebooks emprestados
                    </p>

                    <strong className="card-numero">
                        {resumo?.chromebooks_emprestados ?? 0}
                    </strong>

                    <span className="card-descricao">
                        Equipamentos atualmente em uso
                    </span>
                </div>

                <div className="card">
                    <div className="card-topo">
                        <div className="card-icone card-icone-laranja">
                            <LaptopMinimalCheck size={21} />
                        </div>
                    </div>

                    <p className="card-titulo">
                        Chromebooks disponíveis
                    </p>

                    <strong className="card-numero">
                        {resumo?.chromebooks_disponiveis ?? 0}
                    </strong>

                    <span className="card-descricao">
                        Equipamentos disponíveis para empréstimo
                    </span>
                </div>

                <div className="card">
                    <div className="card-topo">
                        <div className="card-icone card-icone-vermelho">
                            <AlertTriangle size={21} />
                        </div>
                    </div>

                    <p className="card-titulo">
                        Ocorrências abertas
                    </p>

                    <strong className="card-numero">
                        {resumo?.ocorrencias_abertas ?? 0}
                    </strong>

                    <span className="card-descricao">
                        Ocorrências aguardando resolução
                    </span>
                </div>

            </div>

            <div className="dashboard-grid">

                <div className="painel">
                    <div className="painel-cabecalho">
                        <div>
                            <h2 className="painel-titulo">
                                Professores que mais utilizam Chromebooks
                            </h2>

                            <p className="painel-descricao">
                                Ranking baseado na quantidade de equipamentos retirados.
                            </p>
                        </div>

                        <TrendingUp size={20} />
                    </div>

                    <div className="ranking">

                        {ranking.length === 0 ? (
                            <p className="vazio">
                                Nenhum empréstimo registrado.
                            </p>
                        ) : (
                            ranking.slice(0, 5).map((professor, index) => (
                                <div
                                    className="ranking-item"
                                    key={professor.professor_id || index}
                                >
                                    <span className="ranking-posicao">
                                        {index + 1}
                                    </span>

                                    <div className="ranking-info">
                                        <span className="ranking-nome">
                                            {professor.nome}
                                        </span>

                                        <span className="ranking-descricao">
                                            {professor.total_emprestimos} empréstimos
                                        </span>
                                    </div>

                                    <strong className="ranking-valor">
                                        {professor.total_chromebooks}
                                    </strong>
                                </div>
                            ))
                        )}

                    </div>
                </div>

                <div className="painel">
                    <div className="painel-cabecalho">
                        <div>
                            <h2 className="painel-titulo">
                                Ocorrências por sala
                            </h2>

                            <p className="painel-descricao">
                                Salas com maior número de ocorrências.
                            </p>
                        </div>

                        <AlertTriangle size={20} />
                    </div>

                    <div className="ranking">

                        {salas.length === 0 ? (
                            <p className="vazio">
                                Nenhuma ocorrência registrada.
                            </p>
                        ) : (
                            salas.slice(0, 5).map((sala, index) => (
                                <div
                                    className="ranking-item"
                                    key={sala.sala || index}
                                >
                                    <span className="ranking-posicao">
                                        {index + 1}
                                    </span>

                                    <div className="ranking-info">
                                        <span className="ranking-nome">
                                            Sala {sala.sala}
                                        </span>

                                        <span className="ranking-descricao">
                                            Ocorrências registradas
                                        </span>
                                    </div>

                                    <strong className="ranking-valor">
                                        {sala.total_ocorrencias}
                                    </strong>
                                </div>
                            ))
                        )}

                    </div>
                </div>

            </div>

            <div className="painel painel-resumo">

                <div className="painel-cabecalho">
                    <div>
                        <h2 className="painel-titulo">
                            Situação das ocorrências
                        </h2>

                        <p className="painel-descricao">
                            Acompanhamento atual das ocorrências do PROATI.
                        </p>
                    </div>

                    <Users size={20} />
                </div>

                <div className="status">

                    <div className="status-item">
                        <span className="status-numero">
                            {resumo?.ocorrencias_abertas ?? 0}
                        </span>

                        <span className="status-nome">
                            Abertas
                        </span>
                    </div>

                    <div className="status-item">
                        <span className="status-numero">
                            {resumo?.ocorrencias_em_andamento ?? 0}
                        </span>

                        <span className="status-nome">
                            Em andamento
                        </span>
                    </div>

                    <div className="status-item">
                        <span className="status-numero">
                            {resumo?.ocorrencias_resolvidas ?? 0}
                        </span>

                        <span className="status-nome">
                            Resolvidas
                        </span>
                    </div>

                    <div className="status-item">
                        <span className="status-numero">
                            {resumo?.total_ocorrencias ?? 0}
                        </span>

                        <span className="status-nome">
                            Total
                        </span>
                    </div>

                </div>

            </div>

        </section>
    )
}


export default Dashboard