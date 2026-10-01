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

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";

import api from "../../services/api";
import "./Relatorios.css";


function Relatorios() {

    // =========================================================
    // DADOS DOS RELATÓRIOS
    // =========================================================

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


    // =========================================================
    // FILTROS
    // =========================================================

    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [filtroAplicado, setFiltroAplicado] = useState(false);


    // =========================================================
    // ESTADOS
    // =========================================================

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");


    // =========================================================
    // CORES DOS GRÁFICOS
    // =========================================================

    const CORES = [
        "#8b5cf6",
        "#2563eb",
        "#f97316",
        "#10b981",
        "#ef4444",
        "#eab308",
        "#06b6d4",
        "#ec4899"
    ];


    // =========================================================
    // CARREGAR RELATÓRIOS
    // =========================================================

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

                api.get(
                    "/relatorios/ranking-professores",
                    { params }
                ),

                api.get(
                    "/relatorios/ranking-agendamentos-professores",
                    { params }
                ),

                api.get(
                    "/relatorios/ocorrencias-salas",
                    { params }
                ),

                api.get(
                    "/relatorios/ocorrencias-professores",
                    { params }
                ),

                api.get(
                    "/relatorios/ocorrencias-tipos",
                    { params }
                ),

                api.get(
                    "/relatorios/ocorrencias-meses",
                    { params }
                ),

                api.get(
                    "/relatorios/agendamentos-salas",
                    { params }
                ),

                api.get(
                    "/relatorios/agendamentos-turmas",
                    { params }
                ),

                api.get(
                    "/relatorios/emprestimos-turmas",
                    { params }
                )

            ]);


            setDados({

                professores:
                    professores.data.dados || [],

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


            console.log(
                "[RELATORIOS] Relatórios carregados."
            );

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


    // =========================================================
    // CARREGAMENTO INICIAL
    // =========================================================

    useEffect(() => {

        carregarRelatorios();

    }, []);


    // =========================================================
    // APLICAR FILTROS
    // =========================================================

    function aplicarFiltros() {

        if (
            dataInicio &&
            dataFim &&
            dataInicio > dataFim
        ) {

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


    // =========================================================
    // LIMPAR FILTROS
    // =========================================================

    function limparFiltros() {

        setDataInicio("");
        setDataFim("");
        setFiltroAplicado(false);

        carregarRelatorios(
            "",
            ""
        );

    }


    // =========================================================
    // FORMATAR NÚMERO
    // =========================================================

    function formatarNumero(valor) {

        return Number(
            valor || 0
        ).toLocaleString("pt-BR");

    }


    // =========================================================
    // FORMATAR MÊS
    // =========================================================

    function formatarMes(valor) {

        if (!valor) {
            return "-";
        }


        const data = new Date(
            `${valor}-01T00:00:00`
        );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return valor;

        }


        return data.toLocaleDateString(
            "pt-BR",
            {
                month: "short",
                year: "numeric"
            }
        );

    }


    // =========================================================
    // NOME CURTO
    // =========================================================

    function nomeCurto(
        nome,
        limite = 18
    ) {

        if (!nome) {
            return "-";
        }


        if (
            nome.length <= limite
        ) {

            return nome;

        }


        return `${nome.substring(
            0,
            limite
        )}...`;

    }


    // =========================================================
    // TOOLTIP
    // =========================================================

    function TooltipPersonalizado({
        active,
        payload,
        label
    }) {

        if (
            !active ||
            !payload ||
            !payload.length
        ) {

            return null;

        }


        return (

            <div className="grafico-tooltip">

                <strong>
                    {label}
                </strong>


                {payload.map(
                    (item, index) => (

                        <div
                            key={index}
                            className="grafico-tooltip-item"
                        >

                            <span>
                                {item.name}
                            </span>

                            <strong>
                                {formatarNumero(
                                    item.value
                                )}
                            </strong>

                        </div>

                    )
                )}

            </div>

        );

    }


    // =========================================================
    // DADOS DOS GRÁFICOS
    //
    // Só entram registros maiores que zero.
    // Depois ordenamos do maior para o menor.
    // Por fim mostramos apenas os 5 primeiros.
    // =========================================================

    const graficoEmprestimosProfessores =
        dados.professores
            .map((professor) => ({
                nome: nomeCurto(
                    professor.nome
                ),
                total: Number(
                    professor.total_chromebooks
                ) || 0
            }))
            .filter(
                (professor) =>
                    professor.total > 0
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            )
            .slice(0, 5);


    const graficoAgendamentosProfessores =
        dados.agendamentosProfessores
            .map((professor) => ({
                nome: nomeCurto(
                    professor.nome
                ),
                total: Number(
                    professor.total_agendamentos
                ) || 0
            }))
            .filter(
                (professor) =>
                    professor.total > 0
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            )
            .slice(0, 5);


    const graficoSalasOcorrencias =
        dados.salasOcorrencias
            .map((sala) => ({
                nome: nomeCurto(
                    sala.sala
                ),
                total: Number(
                    sala.total_ocorrencias
                ) || 0
            }))
            .filter(
                (sala) =>
                    sala.total > 0
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            );


    const graficoProfessoresOcorrencias =
        dados.professoresOcorrencias
            .map((professor) => ({
                nome: nomeCurto(
                    professor.nome
                ),
                total: Number(
                    professor.total_ocorrencias
                ) || 0
            }))
            .filter(
                (professor) =>
                    professor.total > 0
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            )
            .slice(0, 5);


    const graficoTiposOcorrencias =
        dados.tiposOcorrencias
            .map((tipo) => ({
                nome: tipo.tipo,
                total: Number(
                    tipo.total_ocorrencias
                ) || 0
            }))
            .filter(
                (tipo) =>
                    tipo.total > 0
            );


    const graficoMesesOcorrencias =
        dados.mesesOcorrencias.map(
            (mes) => ({
                mes: formatarMes(
                    mes.mes
                ),
                total: Number(
                    mes.total_ocorrencias
                ) || 0
            })
        );


    const graficoSalasAgendamentos =
        dados.salasAgendamentos
            .map((sala) => ({
                nome: nomeCurto(
                    sala.sala
                ),
                total: Number(
                    sala.total_agendamentos
                ) || 0
            }))
            .filter(
                (sala) =>
                    sala.total > 0
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            );


    const graficoTurmasAgendamentos =
        dados.turmasAgendamentos
            .map((turma) => ({
                nome: nomeCurto(
                    turma.nome
                ),
                total: Number(
                    turma.total_agendamentos
                ) || 0
            }))
            .filter(
                (turma) =>
                    turma.total > 0
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            );


    const graficoTurmasEmprestimos =
        dados.turmasEmprestimos
            .map((turma) => ({
                nome: nomeCurto(
                    turma.nome
                ),
                total: Number(
                    turma.total_chromebooks
                ) || 0
            }))
            .filter(
                (turma) =>
                    turma.total > 0
            )
            .sort(
                (a, b) =>
                    b.total - a.total
            );


    // =========================================================
    // CARREGANDO
    // =========================================================

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


    // =========================================================
    // PÁGINA
    // =========================================================

    return (

        <main className="relatorios-page">


            {/* =====================================================
                CABEÇALHO
            ====================================================== */}

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


            {/* =====================================================
                FILTROS
            ====================================================== */}

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
                                setDataInicio(
                                    e.target.value
                                )
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
                                setDataFim(
                                    e.target.value
                                )
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


            {/* =====================================================
                ERRO
            ====================================================== */}

            {erro && (

                <div className="relatorios-erro">

                    <AlertTriangle size={18} />

                    <span>
                        {erro}
                    </span>

                </div>

            )}


            {/* =====================================================
                RANKINGS
            ====================================================== */}

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


                    {/* =================================================
                        EMPRÉSTIMOS POR PROFESSOR
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-horizontal">

                            {graficoEmprestimosProfessores.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <Monitor size={28} />

                                    <strong>
                                        Nenhum empréstimo registrado
                                    </strong>

                                    <span>
                                        Não existem empréstimos no período selecionado.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <BarChart
                                        data={
                                            graficoEmprestimosProfessores
                                        }
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            left: 20,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="nome"
                                            width={125}
                                            tick={{
                                                fontSize: 12
                                            }}
                                        />

                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Bar
                                            dataKey="total"
                                            name="Chromebooks"
                                            fill="#8b5cf6"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0
                                            ]}
                                            barSize={24}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>


                    {/* =================================================
                        AGENDAMENTOS POR PROFESSOR
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-horizontal">

                            {graficoAgendamentosProfessores.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <CalendarDays size={28} />

                                    <strong>
                                        Nenhum agendamento registrado
                                    </strong>

                                    <span>
                                        Não existem reservas no período selecionado.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <BarChart
                                        data={
                                            graficoAgendamentosProfessores
                                        }
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            left: 20,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="nome"
                                            width={125}
                                            tick={{
                                                fontSize: 12
                                            }}
                                        />

                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Bar
                                            dataKey="total"
                                            name="Agendamentos"
                                            fill="#2563eb"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0
                                            ]}
                                            barSize={24}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>

                </div>

            </section>


            {/* =====================================================
                OCORRÊNCIAS
            ====================================================== */}

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


                    {/* =================================================
                        OCORRÊNCIAS POR SALA
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-horizontal">

                            {graficoSalasOcorrencias.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <AlertTriangle size={28} />

                                    <strong>
                                        Nenhuma ocorrência registrada
                                    </strong>

                                    <span>
                                        Não existem ocorrências no período selecionado.
                                    </span>

                                </div>

                            ) : (

                               <ResponsiveContainer
    width="100%"
    height={320}
>
    <BarChart
        data={graficoSalasOcorrencias}
        margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10
        }}
    >

        <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
        />

        <XAxis
            dataKey="nome"
            tick={{
                fontSize: 12
            }}
        />

        <YAxis
            allowDecimals={false}
        />

        <Tooltip
            content={
                <TooltipPersonalizado />
            }
        />

        <Bar
            dataKey="total"
            name="Ocorrências"
            fill="#ffffff"
            radius={[
                6,
                6,
                0,
                0
            ]}
            barSize={42}
        />

    </BarChart>
</ResponsiveContainer>

                            )}

                        </div>

                    </article>


                    {/* =================================================
                        TIPOS DE OCORRÊNCIA
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-pizza">

                            {graficoTiposOcorrencias.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <AlertTriangle size={28} />

                                    <strong>
                                        Nenhuma ocorrência registrada
                                    </strong>

                                    <span>
                                        Não existem tipos de ocorrência no período.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                graficoTiposOcorrencias
                                            }
                                            dataKey="total"
                                            nameKey="nome"
                                            cx="50%"
                                            cy="45%"
                                            outerRadius={95}
                                            innerRadius={55}
                                            paddingAngle={3}
                                        >

                                            {graficoTiposOcorrencias.map(
                                                (_, index) => (

                                                    <Cell
                                                        key={
                                                            `celula-${index}`
                                                        }
                                                        fill={
                                                            CORES[
                                                                index %
                                                                CORES.length
                                                            ]
                                                        }
                                                    />

                                                )
                                            )}

                                        </Pie>


                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Legend />

                                    </PieChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>


                    {/* =================================================
                        OCORRÊNCIAS POR PROFESSOR
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-horizontal">

                            {graficoProfessoresOcorrencias.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <Users size={28} />

                                    <strong>
                                        Nenhuma ocorrência registrada
                                    </strong>

                                    <span>
                                        Não existem ocorrências no período selecionado.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <BarChart
                                        data={
                                            graficoProfessoresOcorrencias
                                        }
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            left: 20,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="nome"
                                            width={125}
                                            tick={{
                                                fontSize: 12
                                            }}
                                        />

                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Bar
                                            dataKey="total"
                                            name="Ocorrências"
                                            fill="#8b5cf6"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0
                                            ]}
                                            barSize={24}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>


                    {/* =================================================
                        EVOLUÇÃO DAS OCORRÊNCIAS
                    ================================================== */}

                    <article className="relatorio-card grafico-card grafico-card-largo">

                        <div className="card-cabecalho">

                            <div>

                                <h3>
                                    Evolução das ocorrências
                                </h3>

                                <p>
                                    Quantidade de ocorrências registradas por mês.
                                </p>

                            </div>

                            <BarChart3 size={20} />

                        </div>


                        <div className="grafico-container">

                            {graficoMesesOcorrencias.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <BarChart3 size={28} />

                                    <strong>
                                        Nenhum histórico encontrado
                                    </strong>

                                    <span>
                                        Não existem ocorrências para analisar no período.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <LineChart
                                        data={
                                            graficoMesesOcorrencias
                                        }
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 0,
                                            bottom: 10
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="mes"
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                        />

                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            name="Ocorrências"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            dot={{
                                                r: 5
                                            }}
                                            activeDot={{
                                                r: 7
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>

                </div>

            </section>


            {/* =====================================================
                UTILIZAÇÃO
            ====================================================== */}

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


                    {/* =================================================
                        AGENDAMENTOS POR SALA
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-horizontal">

                            {graficoSalasAgendamentos.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <CalendarDays size={28} />

                                    <strong>
                                        Nenhum agendamento registrado
                                    </strong>

                                    <span>
                                        Não existem reservas no período selecionado.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <BarChart
                                        data={
                                            graficoSalasAgendamentos
                                        }
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            left: 20,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="nome"
                                            width={110}
                                            tick={{
                                                fontSize: 12
                                            }}
                                        />

                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Bar
                                            dataKey="total"
                                            name="Agendamentos"
                                            fill="#2563eb"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0
                                            ]}
                                            barSize={24}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>


                    {/* =================================================
                        AGENDAMENTOS POR TURMA
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-horizontal">

                            {graficoTurmasAgendamentos.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <Users size={28} />

                                    <strong>
                                        Nenhum agendamento registrado
                                    </strong>

                                    <span>
                                        Não existem reservas no período selecionado.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <BarChart
                                        data={
                                            graficoTurmasAgendamentos
                                    }
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            left: 20,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="nome"
                                            width={110}
                                            tick={{
                                                fontSize: 12
                                            }}
                                        />

                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Bar
                                            dataKey="total"
                                            name="Agendamentos"
                                            fill="#8b5cf6"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0
                                            ]}
                                            barSize={24}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>


                    {/* =================================================
                        EMPRÉSTIMOS POR TURMA
                    ================================================== */}

                    <article className="relatorio-card grafico-card">

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


                        <div className="grafico-container grafico-horizontal">

                            {graficoTurmasEmprestimos.length === 0 ? (

                                <div className="grafico-sem-dados">

                                    <Monitor size={28} />

                                    <strong>
                                        Nenhum empréstimo registrado
                                    </strong>

                                    <span>
                                        Não existem empréstimos no período selecionado.
                                    </span>

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <BarChart
                                        data={
                                            graficoTurmasEmprestimos
                                        }
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            left: 20,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="nome"
                                            width={110}
                                            tick={{
                                                fontSize: 12
                                            }}
                                        />

                                        <Tooltip
                                            content={
                                                <TooltipPersonalizado />
                                            }
                                        />

                                        <Bar
                                            dataKey="total"
                                            name="Chromebooks"
                                            fill="#f97316"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0
                                            ]}
                                            barSize={24}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </article>

                </div>

            </section>

        </main>

    );

}


export default Relatorios;