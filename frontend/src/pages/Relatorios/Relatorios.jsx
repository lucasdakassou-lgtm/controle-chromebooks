import { useEffect, useState } from "react";
import {
    RefreshCw,
    BarChart3,
    AlertTriangle,
    CalendarDays,
    BookOpen,
    Users,
    Monitor
} from "lucide-react";

import api from "../../services/api";
import "./Relatorios.css";

function Relatorios() {
    const [dados, setDados] = useState({
        professores: [],
        agendamentosProfessores: [],
        salasOcorrencias: [],
        professoresOcorrencias: [],
        tiposOcorrencias: [],
        mesesOcorrencias: [],
        salasAgendamentos: [],
        turmasAgendamentos: [],
        turmasEmprestimos: []
    });

    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");

    const [filtroAplicado, setFiltroAplicado] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregarRelatorios(
        inicio = dataInicio,
        fim = dataFim
    ) {
        try {
            setCarregando(true);
            setErro("");

            const params = {};

            if (inicio) {
                params.data_inicio = inicio;
            }

            if (fim) {
                params.data_fim = fim;
            }

            const [
                professores,
                agendamentosProfessores,
                salasOcorrencias,
                professoresOcorrencias,
                tiposOcorrencias,
                mesesOcorrencias,
                salasAgendamentos,
                turmasAgendamentos,
                turmasEmprestimos
            ] = await Promise.all([
                api.get("/relatorios/ranking-professores", {
                    params
                }),

                api.get("/relatorios/ranking-agendamentos-professores", {
                    params
                }),

                api.get("/relatorios/ocorrencias-salas", {
                    params
                }),

                api.get("/relatorios/ocorrencias-professores", {
                    params
                }),

                api.get("/relatorios/ocorrencias-tipos", {
                    params
                }),

                api.get("/relatorios/ocorrencias-meses", {
                    params
                }),

                api.get("/relatorios/agendamentos-salas", {
                    params
                }),

                api.get("/relatorios/agendamentos-turmas", {
                    params
                }),

                api.get("/relatorios/emprestimos-turmas", {
                    params
                })
            ]);

            setDados({
                professores: professores.data.dados || [],
                agendamentosProfessores:
                    agendamentosProfessores.data.dados || [],
                salasOcorrencias:
                    salasOcorrencias.data.dados || [],
                professoresOcorrencias:
                    professoresOcorrencias.data.dados || [],
                tiposOcorrencias:
                    tiposOcorrencias.data.dados || [],
                mesesOcorrencias:
                    mesesOcorrencias.data.dados || [],
                salasAgendamentos:
                    salasAgendamentos.data.dados || [],
                turmasAgendamentos:
                    turmasAgendamentos.data.dados || [],
                turmasEmprestimos:
                    turmasEmprestimos.data.dados || []
            });

            console.log("[RELATORIOS] Relatórios carregados.");
        } catch (erro) {
            console.error(
                "[RELATORIOS] Erro ao carregar relatórios:",
                erro
            );

            setErro(
                erro.response?.data?.mensagem ||
                "Não foi possível carregar os relatórios."
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarRelatorios();
    }, []);

    function aplicarFiltros() {
        if (dataInicio && dataFim && dataInicio > dataFim) {
            setErro(
                "A data inicial não pode ser maior que a data final."
            );

            return;
        }

        setFiltroAplicado(
            Boolean(dataInicio || dataFim)
        );

        carregarRelatorios(
            dataInicio,
            dataFim
        );
    }

    function limparFiltros() {
        setDataInicio("");
        setDataFim("");
        setFiltroAplicado(false);

        carregarRelatorios("", "");
    }

    function maiorValor(lista, campo) {
        if (!lista.length) {
            return 0;
        }

        return Math.max(
            ...lista.map((item) => Number(item[campo]) || 0)
        );
    }

    function porcentagem(valor, maior) {
        if (!maior) {
            return 0;
        }

        return Math.round(
            (Number(valor) / maior) * 100
        );
    }

    function formatarNumero(valor) {
        return Number(valor || 0).toLocaleString("pt-BR");
    }

    function formatarMes(valor) {
        if (!valor) {
            return "-";
        }

        const data = new Date(`${valor}-01T00:00:00`);

        if (Number.isNaN(data.getTime())) {
            return valor;
        }

        return data.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric"
        });
    }

    const maiorEmprestimo = maiorValor(
        dados.professores,
        "total_chromebooks"
    );

    const maiorAgendamento = maiorValor(
        dados.agendamentosProfessores,
        "total_agendamentos"
    );

    const maiorSalaOcorrencia = maiorValor(
        dados.salasOcorrencias,
        "total_ocorrencias"
    );

    const maiorProfessorOcorrencia = maiorValor(
        dados.professoresOcorrencias,
        "total_ocorrencias"
    );

    const maiorTipoOcorrencia = maiorValor(
        dados.tiposOcorrencias,
        "total_ocorrencias"
    );

    const maiorMesOcorrencia = maiorValor(
        dados.mesesOcorrencias,
        "total_ocorrencias"
    );

    const maiorSalaAgendamento = maiorValor(
        dados.salasAgendamentos,
        "total_agendamentos"
    );

    const maiorTurmaAgendamento = maiorValor(
        dados.turmasAgendamentos,
        "total_agendamentos"
    );

    const maiorTurmaEmprestimo = maiorValor(
        dados.turmasEmprestimos,
        "total_chromebooks"
    );

    if (carregando) {
        return (
            <main className="relatorios-page">
                <div className="relatorios-loading">
                    <RefreshCw
                        size={22}
                        className="relatorios-loading-icon"
                    />

                    <span>
                        Carregando relatórios...
                    </span>
                </div>
            </main>
        );
    }

    return (
        <main className="relatorios-page">

            <header className="relatorios-cabecalho">

                <div>
                    <div className="relatorios-titulo">
                        <BarChart3 size={24} />

                        <h1>
                            Relatórios
                        </h1>
                    </div>

                    <p>
                        Análise histórica e utilização do sistema.
                    </p>
                </div>

                <button
                    className="relatorios-atualizar"
                    onClick={() =>
                        carregarRelatorios()
                    }
                >
                    <RefreshCw size={17} />

                    Atualizar
                </button>

            </header>

            <section className="relatorios-filtros">

                <div className="filtros-titulo">

                    <div>
                        <h2>
                            Filtros
                        </h2>

                        <p>
                            Defina o período para analisar os dados.
                        </p>
                    </div>

                    {filtroAplicado && (
                        <span className="filtro-status">
                            Filtro aplicado
                        </span>
                    )}

                </div>

                <div className="filtros-controles">

                    <div className="filtro-campo">

                        <label htmlFor="dataInicio">
                            Data inicial
                        </label>

                        <input
                            id="dataInicio"
                            type="date"
                            value={dataInicio}
                            onChange={(e) =>
                                setDataInicio(e.target.value)
                            }
                        />

                    </div>

                    <div className="filtro-campo">

                        <label htmlFor="dataFim">
                            Data final
                        </label>

                        <input
                            id="dataFim"
                            type="date"
                            value={dataFim}
                            onChange={(e) =>
                                setDataFim(e.target.value)
                            }
                        />

                    </div>

                    <div className="filtros-acoes">

                        <button
                            className="botao-aplicar-filtro"
                            onClick={aplicarFiltros}
                        >
                            Aplicar filtros
                        </button>

                        <button
                            className="botao-limpar-filtro"
                            onClick={limparFiltros}
                        >
                            Limpar
                        </button>

                    </div>

                </div>

            </section>

            {erro && (
                <div className="relatorios-erro">
                    <AlertTriangle size={18} />

                    <span>
                        {erro}
                    </span>
                </div>
            )}

            {/* RANKINGS */}

            <section className="relatorios-secao">

                <div className="secao-cabecalho">

                    <div className="secao-icone">
                        <Users size={19} />
                    </div>

                    <div>
                        <h2>
                            Rankings
                        </h2>

                        <p>
                            Principais movimentações realizadas por professores.
                        </p>
                    </div>

                </div>

                <div className="relatorios-grid">

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Empréstimos por professor
                                </h3>

                                <p>
                                    Quantidade de Chromebooks retirados.
                                </p>
                            </div>

                            <Monitor size={20} />

                        </div>

                        <div className="ranking-lista">

                            {dados.professores.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.professores.map(
                                    (professor, index) => (
                                        <div
                                            className="ranking-item"
                                            key={professor.id}
                                        >

                                            <div className="ranking-topo">

                                                <div className="ranking-nome">

                                                    <span className="ranking-posicao">
                                                        {index + 1}
                                                    </span>

                                                    <span>
                                                        {professor.nome}
                                                    </span>

                                                </div>

                                                <strong>
                                                    {formatarNumero(
                                                        professor.total_chromebooks
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-roxa"
                                                    style={{
                                                        width: `${porcentagem(
                                                            professor.total_chromebooks,
                                                            maiorEmprestimo
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Agendamentos por professor
                                </h3>

                                <p>
                                    Quantidade de reservas realizadas.
                                </p>
                            </div>

                            <CalendarDays size={20} />

                        </div>

                        <div className="ranking-lista">

                            {dados.agendamentosProfessores.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.agendamentosProfessores.map(
                                    (professor, index) => (
                                        <div
                                            className="ranking-item"
                                            key={professor.id}
                                        >

                                            <div className="ranking-topo">

                                                <div className="ranking-nome">

                                                    <span className="ranking-posicao">
                                                        {index + 1}
                                                    </span>

                                                    <span>
                                                        {professor.nome}
                                                    </span>

                                                </div>

                                                <strong>
                                                    {formatarNumero(
                                                        professor.total_agendamentos
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-azul"
                                                    style={{
                                                        width: `${porcentagem(
                                                            professor.total_agendamentos,
                                                            maiorAgendamento
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                </div>

            </section>

            {/* OCORRÊNCIAS */}

            <section className="relatorios-secao">

                <div className="secao-cabecalho">

                    <div className="secao-icone secao-icone-laranja">
                        <AlertTriangle size={19} />
                    </div>

                    <div>
                        <h2>
                            Ocorrências
                        </h2>

                        <p>
                            Histórico e distribuição das ocorrências registradas.
                        </p>
                    </div>

                </div>

                <div className="relatorios-grid">

                    {/* OCORRÊNCIAS POR SALA */}

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Ocorrências por sala
                                </h3>

                                <p>
                                    Salas com maior quantidade de ocorrências.
                                </p>
                            </div>

                            <AlertTriangle size={20} />

                        </div>

                        <div className="dados-lista">

                            {dados.salasOcorrencias.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.salasOcorrencias.map(
                                    (sala) => (
                                        <div
                                            className="dado-item"
                                            key={sala.sala}
                                        >

                                            <div className="dado-topo">

                                                <span>
                                                    {sala.sala}
                                                </span>

                                                <strong>
                                                    {formatarNumero(
                                                        sala.total_ocorrencias
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-laranja"
                                                    style={{
                                                        width: `${porcentagem(
                                                            sala.total_ocorrencias,
                                                            maiorSalaOcorrencia
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                    {/* TIPOS */}

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Tipos de ocorrência
                                </h3>

                                <p>
                                    Principais motivos registrados.
                                </p>
                            </div>

                            <AlertTriangle size={20} />

                        </div>

                        <div className="dados-lista">

                            {dados.tiposOcorrencias.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.tiposOcorrencias.map(
                                    (tipo) => (
                                        <div
                                            className="dado-item"
                                            key={tipo.tipo}
                                        >

                                            <div className="dado-topo">

                                                <span>
                                                    {tipo.tipo}
                                                </span>

                                                <strong>
                                                    {formatarNumero(
                                                        tipo.total_ocorrencias
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-laranja"
                                                    style={{
                                                        width: `${porcentagem(
                                                            tipo.total_ocorrencias,
                                                            maiorTipoOcorrencia
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                    {/* PROFESSORES */}

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Ocorrências por professor
                                </h3>

                                <p>
                                    Professores que mais registraram ocorrências.
                                </p>
                            </div>

                            <Users size={20} />

                        </div>

                        <div className="dados-lista">

                            {dados.professoresOcorrencias.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.professoresOcorrencias.map(
                                    (professor) => (
                                        <div
                                            className="dado-item"
                                            key={professor.id}
                                        >

                                            <div className="dado-topo">

                                                <span>
                                                    {professor.nome}
                                                </span>

                                                <strong>
                                                    {formatarNumero(
                                                        professor.total_ocorrencias
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-roxa"
                                                    style={{
                                                        width: `${porcentagem(
                                                            professor.total_ocorrencias,
                                                            maiorProfessorOcorrencia
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                    {/* EVOLUÇÃO */}

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Evolução das ocorrências
                                </h3>

                                <p>
                                    Quantidade de ocorrências por mês.
                                </p>
                            </div>

                            <BarChart3 size={20} />

                        </div>

                        <div className="dados-lista">

                            {dados.mesesOcorrencias.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.mesesOcorrencias.map(
                                    (mes) => (
                                        <div
                                            className="dado-item"
                                            key={mes.mes}
                                        >

                                            <div className="dado-topo">

                                                <span>
                                                    {formatarMes(mes.mes)}
                                                </span>

                                                <strong>
                                                    {formatarNumero(
                                                        mes.total_ocorrencias
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-azul"
                                                    style={{
                                                        width: `${porcentagem(
                                                            mes.total_ocorrencias,
                                                            maiorMesOcorrencia
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                </div>

            </section>

            {/* UTILIZAÇÃO */}

            <section className="relatorios-secao">

                <div className="secao-cabecalho">

                    <div className="secao-icone secao-icone-azul">
                        <BookOpen size={19} />
                    </div>

                    <div>
                        <h2>
                            Utilização
                        </h2>

                        <p>
                            Análise do uso das salas, turmas e Chromebooks.
                        </p>
                    </div>

                </div>

                <div className="relatorios-grid">

                    {/* SALAS */}

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Agendamentos por sala
                                </h3>

                                <p>
                                    Utilização das salas através de reservas.
                                </p>
                            </div>

                            <CalendarDays size={20} />

                        </div>

                        <div className="dados-lista">

                            {dados.salasAgendamentos.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.salasAgendamentos.map(
                                    (sala) => (
                                        <div
                                            className="dado-item"
                                            key={sala.sala}
                                        >

                                            <div className="dado-topo">

                                                <span>
                                                    {sala.sala}
                                                </span>

                                                <strong>
                                                    {formatarNumero(
                                                        sala.total_agendamentos
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-azul"
                                                    style={{
                                                        width: `${porcentagem(
                                                            sala.total_agendamentos,
                                                            maiorSalaAgendamento
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                    {/* TURMAS AGENDAMENTOS */}

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Agendamentos por turma
                                </h3>

                                <p>
                                    Turmas que mais utilizam as salas.
                                </p>
                            </div>

                            <Users size={20} />

                        </div>

                        <div className="dados-lista">

                            {dados.turmasAgendamentos.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.turmasAgendamentos.map(
                                    (turma) => (
                                        <div
                                            className="dado-item"
                                            key={turma.id}
                                        >

                                            <div className="dado-topo">

                                                <span>
                                                    {turma.nome}
                                                </span>

                                                <strong>
                                                    {formatarNumero(
                                                        turma.total_agendamentos
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-roxa"
                                                    style={{
                                                        width: `${porcentagem(
                                                            turma.total_agendamentos,
                                                            maiorTurmaAgendamento
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                    {/* TURMAS EMPRÉSTIMOS */}

                    <article className="relatorio-card">

                        <div className="card-cabecalho">

                            <div>
                                <h3>
                                    Empréstimos por turma
                                </h3>

                                <p>
                                    Quantidade de Chromebooks retirados por turma.
                                </p>
                            </div>

                            <Monitor size={20} />

                        </div>

                        <div className="dados-lista">

                            {dados.turmasEmprestimos.length === 0 ? (
                                <div className="relatorio-vazio">
                                    Nenhum dado encontrado.
                                </div>
                            ) : (
                                dados.turmasEmprestimos.map(
                                    (turma) => (
                                        <div
                                            className="dado-item"
                                            key={turma.id}
                                        >

                                            <div className="dado-topo">

                                                <span>
                                                    {turma.nome}
                                                </span>

                                                <strong>
                                                    {formatarNumero(
                                                        turma.total_chromebooks
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="barra-fundo">

                                                <div
                                                    className="barra-preenchida barra-laranja"
                                                    style={{
                                                        width: `${porcentagem(
                                                            turma.total_chromebooks,
                                                            maiorTurmaEmprestimo
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </article>

                </div>

            </section>

        </main>
    );
}

export default Relatorios;