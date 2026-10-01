import { useEffect, useMemo, useState } from "react";

import {
    Laptop,
    Tablet,
    Search,
    Plus,
    RefreshCw,
    RotateCcw,
    X,
    Save,
    AlertTriangle
} from "lucide-react";

import api from "../../services/api";
import "./Emprestimos.css";


function Emprestimos() {

    // =========================================================
    // DADOS
    // =========================================================

    const [emprestimos, setEmprestimos] = useState([]);

    const [professores, setProfessores] = useState([]);

    const [turmas, setTurmas] = useState([]);


    // =========================================================
    // DISPONIBILIDADE
    // =========================================================

    const [disponibilidadeChromebook, setDisponibilidadeChromebook] =
        useState({
            total: 0,
            emprestados: 0,
            disponivel: 0
        });

    const [disponibilidadeTablet, setDisponibilidadeTablet] =
        useState({
            total: 0,
            emprestados: 0,
            disponivel: 0
        });


    // =========================================================
    // BUSCA
    // =========================================================

    const [busca, setBusca] = useState("");


    // =========================================================
    // ESTADOS DA PÁGINA
    // =========================================================

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");

    const [mensagemSucesso, setMensagemSucesso] = useState("");


    // =========================================================
    // MODAL
    // =========================================================

    const [modalAberto, setModalAberto] = useState(false);

    const [salvando, setSalvando] = useState(false);

    const [erroFormulario, setErroFormulario] = useState("");


    // =========================================================
    // FORMULÁRIO
    // =========================================================

    const [tipoEquipamento, setTipoEquipamento] =
        useState("CHROMEBOOK");

    const [finalidade, setFinalidade] =
        useState("AULA");

    const [professorSelecionado, setProfessorSelecionado] =
        useState("");

    const [turmaSelecionada, setTurmaSelecionada] =
        useState("");

    const [quantidade, setQuantidade] =
        useState("");


    // =========================================================
    // DEVOLUÇÃO
    // =========================================================

    const [devolvendoId, setDevolvendoId] =
        useState(null);


    // =========================================================
    // CARREGAR EMPRÉSTIMOS
    // =========================================================

    async function carregarEmprestimos() {

        try {

            const resposta =
                await api.get("/emprestimos/ativos");


            const dados =
                resposta.data?.emprestimos ||
                resposta.data?.dados ||
                [];


            setEmprestimos(dados);


            console.log(
                "[EMPRESTIMOS] Empréstimos ativos carregados:",
                dados.length
            );


        } catch (erro) {

            console.error(
                "[EMPRESTIMOS] Erro ao carregar empréstimos:",
                erro
            );


            setErro(
                erro.response?.data?.mensagem ||
                "Não foi possível carregar os empréstimos."
            );

        }

    }


    // =========================================================
    // CARREGAR PROFESSORES
    // =========================================================

    async function carregarProfessores() {

        try {

            const resposta =
                await api.get("/professores");


            const dados =
                resposta.data?.professores ||
                resposta.data?.dados ||
                resposta.data ||
                [];


            setProfessores(
                Array.isArray(dados)
                    ? dados
                    : []
            );


            console.log(
                "[EMPRESTIMOS] Professores carregados:",
                dados.length
            );


        } catch (erro) {

            console.error(
                "[EMPRESTIMOS] Erro ao carregar professores:",
                erro
            );

        }

    }


    // =========================================================
    // CARREGAR TURMAS
    // =========================================================

    async function carregarTurmas() {

        try {

            const resposta =
                await api.get("/turmas");


            const dados =
                resposta.data?.turmas ||
                resposta.data?.dados ||
                resposta.data ||
                [];


            setTurmas(
                Array.isArray(dados)
                    ? dados
                    : []
            );


            console.log(
                "[EMPRESTIMOS] Turmas carregadas:",
                dados.length
            );


        } catch (erro) {

            console.error(
                "[EMPRESTIMOS] Erro ao carregar turmas:",
                erro
            );

        }

    }


    // =========================================================
    // CARREGAR DISPONIBILIDADE
    // =========================================================

    async function carregarDisponibilidade() {

        try {

            const [
                chromebooks,
                tablets
            ] = await Promise.all([

                api.get(
                    "/emprestimos/disponibilidade",
                    {
                        params: {
                            tipo_equipamento:
                                "CHROMEBOOK"
                        }
                    }
                ),

                api.get(
                    "/emprestimos/disponibilidade",
                    {
                        params: {
                            tipo_equipamento:
                                "TABLET"
                        }
                    }
                )

            ]);


            setDisponibilidadeChromebook({
                total:
                    Number(
                        chromebooks.data?.total
                    ) || 0,

                emprestados:
                    Number(
                        chromebooks.data?.emprestados
                    ) || 0,

                disponivel:
                    Number(
                        chromebooks.data?.disponivel
                    ) || 0
            });


            setDisponibilidadeTablet({
                total:
                    Number(
                        tablets.data?.total
                    ) || 0,

                emprestados:
                    Number(
                        tablets.data?.emprestados
                    ) || 0,

                disponivel:
                    Number(
                        tablets.data?.disponivel
                    ) || 0
            });


            console.log(
                "[EMPRESTIMOS] Disponibilidade atualizada."
            );


        } catch (erro) {

            console.error(
                "[EMPRESTIMOS] Erro ao carregar disponibilidade:",
                erro
            );

        }

    }


    // =========================================================
    // CARREGAR TUDO
    // =========================================================

    async function carregarDados() {

        try {

            setCarregando(true);
            setErro("");

            await Promise.all([
                carregarEmprestimos(),
                carregarProfessores(),
                carregarTurmas(),
                carregarDisponibilidade()
            ]);

        } finally {

            setCarregando(false);

        }

    }


    // =========================================================
    // CARREGAMENTO INICIAL
    // =========================================================

    useEffect(() => {

        carregarDados();

    }, []);


    // =========================================================
    // LIMPAR MENSAGEM DE SUCESSO
    // =========================================================

    useEffect(() => {

        if (!mensagemSucesso) {
            return;
        }


        const tempo =
            setTimeout(() => {

                setMensagemSucesso("");

            }, 3500);


        return () => clearTimeout(tempo);

    }, [mensagemSucesso]);


    // =========================================================
    // DISPONIBILIDADE DO TIPO SELECIONADO
    // =========================================================

    const equipamentoSelecionado =
        tipoEquipamento === "CHROMEBOOK"
            ? disponibilidadeChromebook
            : disponibilidadeTablet;


    // =========================================================
    // EQUIPAMENTOS EMPRESTADOS
    // =========================================================

    const totalEmprestado =
        disponibilidadeChromebook.emprestados +
        disponibilidadeTablet.emprestados;


    // =========================================================
    // TOTAL DE EQUIPAMENTOS
    // =========================================================

    const totalEquipamentos =
        disponibilidadeChromebook.total +
        disponibilidadeTablet.total;


    // =========================================================
    // TOTAL DISPONÍVEL
    // =========================================================

    const totalDisponivel =
        disponibilidadeChromebook.disponivel +
        disponibilidadeTablet.disponivel;


    // =========================================================
    // FILTRAR EMPRÉSTIMOS
    // =========================================================

    const emprestimosFiltrados =
        useMemo(() => {

            const termo =
                busca
                    .trim()
                    .toLowerCase();


            if (!termo) {
                return emprestimos;
            }


            return emprestimos.filter(
                (emprestimo) => {

                    const professor =
                        String(
                            emprestimo.professor ||
                            ""
                        ).toLowerCase();


                    const turma =
                        String(
                            emprestimo.turma ||
                            ""
                        ).toLowerCase();


                    const equipamento =
                        String(
                            emprestimo.tipo_equipamento ||
                            ""
                        ).toLowerCase();


                    const finalidadeEmprestimo =
                        String(
                            emprestimo.finalidade ||
                            ""
                        ).toLowerCase();


                    return (
                        professor.includes(termo) ||
                        turma.includes(termo) ||
                        equipamento.includes(termo) ||
                        finalidadeEmprestimo.includes(termo)
                    );

                }
            );

        }, [emprestimos, busca]);


    // =========================================================
    // ABRIR MODAL
    // =========================================================

    function abrirModal() {

        setTipoEquipamento("CHROMEBOOK");

        setFinalidade("AULA");

        setProfessorSelecionado("");

        setTurmaSelecionada("");

        setQuantidade("");

        setErroFormulario("");

        setModalAberto(true);

    }


    // =========================================================
    // FECHAR MODAL
    // =========================================================

    function fecharModal() {

        if (salvando) {
            return;
        }


        setModalAberto(false);

        setTipoEquipamento("CHROMEBOOK");

        setFinalidade("AULA");

        setProfessorSelecionado("");

        setTurmaSelecionada("");

        setQuantidade("");

        setErroFormulario("");

    }


    // =========================================================
    // ALTERAR FINALIDADE
    // =========================================================

    function alterarFinalidade(novaFinalidade) {

        setFinalidade(novaFinalidade);

        setErroFormulario("");


        // Uso próprio não precisa de turma.
        if (novaFinalidade === "USO_PROPRIO") {

            setTurmaSelecionada("");

        }

    }


    // =========================================================
    // REGISTRAR EMPRÉSTIMO
    // =========================================================

    async function registrarEmprestimo(event) {

        event.preventDefault();


        setErroFormulario("");


        const quantidadeNumerica =
            Number(quantidade);


        // -----------------------------------------------------
        // VALIDAÇÕES
        // -----------------------------------------------------

        if (!professorSelecionado) {

            setErroFormulario(
                "Selecione o professor."
            );

            return;

        }


        if (
            finalidade === "AULA" &&
            !turmaSelecionada
        ) {

            setErroFormulario(
                "Selecione a turma."
            );

            return;

        }


        if (
            !quantidade ||
            quantidadeNumerica <= 0
        ) {

            setErroFormulario(
                "Informe uma quantidade maior que zero."
            );

            return;

        }


        if (
            quantidadeNumerica >
            equipamentoSelecionado.disponivel
        ) {

            setErroFormulario(
                `A quantidade informada é maior que a disponibilidade atual. ` +
                `Disponíveis: ${equipamentoSelecionado.disponivel}.`
            );

            return;

        }


        try {

            setSalvando(true);


            const dados = {

                professor_id:
                    Number(
                        professorSelecionado
                    ),

                turma_id:
                    finalidade === "AULA"
                        ? Number(turmaSelecionada)
                        : null,

                quantidade:
                    quantidadeNumerica,

                tipo_equipamento:
                    tipoEquipamento,

                finalidade:
                    finalidade

            };


            console.log(
                "[EMPRESTIMOS] Registrando:",
                dados
            );


            await api.post(
                "/emprestimos",
                dados
            );


            setMensagemSucesso(
                finalidade === "USO_PROPRIO"
                    ? `${tipoEquipamento === "TABLET"
                        ? "Tablets"
                        : "Chromebooks"
                    } registrados para uso próprio com sucesso.`
                    : `${tipoEquipamento === "TABLET"
                        ? "Tablets"
                        : "Chromebooks"
                    } emprestados com sucesso.`
            );


            fecharModal();


            await carregarDados();


        } catch (erro) {

            console.error(
                "[EMPRESTIMOS] Erro ao registrar:",
                erro
            );


            setErroFormulario(
                erro.response?.data?.mensagem ||
                "Não foi possível registrar o empréstimo."
            );

        } finally {

            setSalvando(false);

        }

    }


    // =========================================================
    // DEVOLVER EMPRÉSTIMO
    // =========================================================

    async function devolverEmprestimo(id) {

        const confirmar =
            window.confirm(
                "Deseja registrar a devolução deste empréstimo?"
            );


        if (!confirmar) {
            return;
        }


        try {

            setDevolvendoId(id);

            setErro("");


            console.log(
                `[EMPRESTIMOS] Devolvendo empréstimo ${id}.`
            );


            await api.post(
                `/emprestimos/${id}/devolver`
            );


            setMensagemSucesso(
                "Devolução registrada com sucesso."
            );


            await carregarDados();


        } catch (erro) {

            console.error(
                "[EMPRESTIMOS] Erro ao devolver:",
                erro
            );


            setErro(
                erro.response?.data?.mensagem ||
                "Não foi possível registrar a devolução."
            );

        } finally {

            setDevolvendoId(null);

        }

    }


    // =========================================================
    // FORMATAR DATA
    // =========================================================

    function formatarData(data) {

        if (!data) {
            return "-";
        }


        const dataFormatada =
            new Date(data);


        if (
            Number.isNaN(
                dataFormatada.getTime()
            )
        ) {

            return "-";

        }


        return dataFormatada.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // =========================================================
    // NOME DO EQUIPAMENTO
    // =========================================================

    function nomeEquipamento(tipo) {

        if (tipo === "TABLET") {
            return "Tablet";
        }


        return "Chromebook";

    }


    // =========================================================
    // ÍCONE DO EQUIPAMENTO
    // =========================================================

    function iconeEquipamento(tipo) {

        if (tipo === "TABLET") {
            return <Tablet size={16} />;
        }


        return <Laptop size={16} />;

    }


    // =========================================================
    // CLASSE DO EQUIPAMENTO
    // =========================================================

    function classeEquipamento(tipo) {

        if (tipo === "TABLET") {
            return "equipamento-tablet";
        }


        return "equipamento-chromebook";

    }


    // =========================================================
    // NOME DA FINALIDADE
    // =========================================================

    function nomeFinalidade(finalidadeEmprestimo) {

        if (
            finalidadeEmprestimo ===
            "USO_PROPRIO"
        ) {

            return "Uso próprio";

        }


        return "Aula";

    }


    // =========================================================
    // CARREGANDO
    // =========================================================

    if (carregando) {

        return (

            <main className="emprestimos">

                <div className="relatorios-loading">

                    <RefreshCw
                        size={22}
                        className="relatorios-loading-icon"
                    />

                    <span>
                        Carregando empréstimos...
                    </span>

                </div>

            </main>

        );

    }


    // =========================================================
    // PÁGINA
    // =========================================================

    return (

        <main className="emprestimos">


            {/* =====================================================
                CABEÇALHO
            ====================================================== */}

            <header className="emprestimos-cabecalho">

                <div>

                    <h1>
                        Empréstimos
                    </h1>

                    <p>
                        Controle de retirada e devolução dos equipamentos.
                    </p>

                </div>


                <div className="emprestimos-acoes">

                    <button
                        className="botao-atualizar"
                        onClick={carregarDados}
                    >

                        <RefreshCw size={17} />

                        Atualizar

                    </button>


                    <button
                        className="botao-novo-emprestimo"
                        onClick={abrirModal}
                    >

                        <Plus size={18} />

                        Novo empréstimo

                    </button>

                </div>

            </header>


            {/* =====================================================
                MENSAGEM DE SUCESSO
            ====================================================== */}

            {mensagemSucesso && (

                <div className="mensagem-sucesso">

                    <span>
                        {mensagemSucesso}
                    </span>

                </div>

            )}


            {/* =====================================================
                ERRO
            ====================================================== */}

            {erro && (

                <div className="mensagem-erro">

                    <AlertTriangle size={18} />

                    <span>
                        {erro}
                    </span>

                    <button
                        onClick={() =>
                            setErro("")
                        }
                    >

                        <X size={16} />

                    </button>

                </div>

            )}


            {/* =====================================================
                CARDS
            ====================================================== */}

            <section className="cards">


                {/* CHROMEBOOKS */}

                <div className="card">

                    <div className="card-icone">

                        <Laptop size={22} />

                    </div>

                    <span>
                        Chromebooks
                    </span>

                    <strong>
                        {disponibilidadeChromebook.total}
                    </strong>

                    <small>
                        {disponibilidadeChromebook.disponivel} disponíveis
                    </small>

                </div>


                {/* TABLETS */}

                <div className="card">

                    <div className="card-icone">

                        <Tablet size={22} />

                    </div>

                    <span>
                        Tablets
                    </span>

                    <strong>
                        {disponibilidadeTablet.total}
                    </strong>

                    <small>
                        {disponibilidadeTablet.disponivel} disponíveis
                    </small>

                </div>


                {/* DISPONIBILIDADE GERAL */}

                <div className="card">

                    <div className="card-icone">

                        <Laptop size={22} />

                    </div>

                    <span>
                        Equipamentos disponíveis
                    </span>

                    <strong>
                        {totalDisponivel}
                    </strong>

                    <small>
                        {totalEmprestado} atualmente emprestados
                    </small>

                </div>

            </section>


            {/* =====================================================
                RESUMO
            ====================================================== */}

            <div className="emprestimos-resumo">

                <span>
                    Total de equipamentos:
                    <strong>
                        {" "}
                        {totalEquipamentos}
                    </strong>
                </span>

                <span>
                    Em uso:
                    <strong>
                        {" "}
                        {totalEmprestado}
                    </strong>
                </span>

                <span>
                    Disponíveis:
                    <strong>
                        {" "}
                        {totalDisponivel}
                    </strong>
                </span>

            </div>


            {/* =====================================================
                LISTA
            ====================================================== */}

            <section className="emprestimos-lista">


                {/* CABEÇALHO */}

                <div className="lista-cabecalho">

                    <div>

                        <h2>
                            Empréstimos ativos
                        </h2>

                        <p>
                            Equipamentos que ainda não foram devolvidos.
                        </p>

                    </div>


                    <div className="emprestimos-busca">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Buscar professor, turma ou equipamento..."
                            value={busca}
                            onChange={(event) =>
                                setBusca(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* TABELA */}

                {emprestimosFiltrados.length === 0 ? (

                    <div className="lista-vazia">

                        <Laptop size={30} />

                        <strong>
                            Nenhum empréstimo ativo
                        </strong>

                        <span>
                            {busca
                                ? "Nenhum empréstimo corresponde à busca."
                                : "Não existem equipamentos emprestados no momento."
                            }
                        </span>

                    </div>

                ) : (

                    <div className="tabela-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Equipamento
                                    </th>

                                    <th>
                                        Finalidade
                                    </th>

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
                                        Retirada
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Ação
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {emprestimosFiltrados.map(
                                    (emprestimo) => (

                                        <tr
                                            key={
                                                emprestimo.id
                                            }
                                        >


                                            {/* EQUIPAMENTO */}

                                            <td>

                                                <span
                                                    className={
                                                        `equipamento-badge ` +
                                                        classeEquipamento(
                                                            emprestimo.tipo_equipamento
                                                        )
                                                    }
                                                >

                                                    {
                                                        iconeEquipamento(
                                                            emprestimo.tipo_equipamento
                                                        )
                                                    }

                                                    {
                                                        nomeEquipamento(
                                                            emprestimo.tipo_equipamento
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* FINALIDADE */}

                                            <td>

                                                <span>
                                                    {
                                                        nomeFinalidade(
                                                            emprestimo.finalidade
                                                        )
                                                    }
                                                </span>

                                            </td>


                                            {/* PROFESSOR */}

                                            <td>

                                                {
                                                    emprestimo.professor ||
                                                    "Não informado"
                                                }

                                            </td>


                                            {/* TURMA */}

                                            <td>

                                                {
                                                    emprestimo.turma ||
                                                    (
                                                        emprestimo.finalidade ===
                                                        "USO_PROPRIO"
                                                            ? "Não se aplica"
                                                            : "Não informada"
                                                    )
                                                }

                                            </td>


                                            {/* QUANTIDADE */}

                                            <td>

                                                <strong>
                                                    {
                                                        emprestimo.quantidade
                                                    }
                                                </strong>

                                            </td>


                                            {/* DATA */}

                                            <td>

                                                {
                                                    formatarData(
                                                        emprestimo.data_retirada
                                                    )
                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span className="status-ativo">

                                                    Ativo

                                                </span>

                                            </td>


                                            {/* DEVOLVER */}

                                            <td>

                                                <button
                                                    className="botao-devolver"
                                                    disabled={
                                                        devolvendoId ===
                                                        emprestimo.id
                                                    }
                                                    onClick={() =>
                                                        devolverEmprestimo(
                                                            emprestimo.id
                                                        )
                                                    }
                                                >

                                                    {devolvendoId ===
                                                    emprestimo.id ? (

                                                        <RefreshCw
                                                            size={16}
                                                            className="girando"
                                                        />

                                                    ) : (

                                                        <RotateCcw
                                                            size={16}
                                                        />

                                                    )}

                                                    {devolvendoId ===
                                                    emprestimo.id
                                                        ? "Devolvendo..."
                                                        : "Devolver"
                                                    }

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


            {/* =====================================================
                MODAL NOVO EMPRÉSTIMO
            ====================================================== */}

            {modalAberto && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            fecharModal();

                        }

                    }}
                >

                    <div className="modal-emprestimo">


                        {/* CABEÇALHO DO MODAL */}

                        <div className="modal-cabecalho">

                            <div>

                                <h2>
                                    Novo empréstimo
                                </h2>

                                <p>
                                    Registre a retirada de equipamentos.
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


                        {/* FORMULÁRIO */}

                        <form
                            onSubmit={
                                registrarEmprestimo
                            }
                        >


                            {/* FINALIDADE */}

                            <div className="formulario-campo">

                                <label>
                                    Finalidade
                                </label>


                                <div className="tipo-equipamento-opcoes">

                                    <button
                                        type="button"
                                        className={
                                            `tipo-equipamento-opcao ` +
                                            (
                                                finalidade ===
                                                "AULA"
                                                    ? "selecionado"
                                                    : ""
                                            )
                                        }
                                        onClick={() =>
                                            alterarFinalidade(
                                                "AULA"
                                            )
                                        }
                                        disabled={salvando}
                                    >

                                        <div>

                                            <strong>
                                                Para aula
                                            </strong>

                                            <span>
                                                Vinculado a uma turma
                                            </span>

                                        </div>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `tipo-equipamento-opcao ` +
                                            (
                                                finalidade ===
                                                "USO_PROPRIO"
                                                    ? "selecionado"
                                                    : ""
                                            )
                                        }
                                        onClick={() =>
                                            alterarFinalidade(
                                                "USO_PROPRIO"
                                            )
                                        }
                                        disabled={salvando}
                                    >

                                        <div>

                                            <strong>
                                                Uso próprio
                                            </strong>

                                            <span>
                                                Sem vínculo com turma
                                            </span>

                                        </div>

                                    </button>

                                </div>

                            </div>


                            {/* TIPO DE EQUIPAMENTO */}

                            <div className="formulario-campo">

                                <label>
                                    Tipo de equipamento
                                </label>


                                <div className="tipo-equipamento-opcoes">


                                    <button
                                        type="button"
                                        className={
                                            `tipo-equipamento-opcao ` +
                                            (
                                                tipoEquipamento ===
                                                "CHROMEBOOK"
                                                    ? "selecionado"
                                                    : ""
                                            )
                                        }
                                        onClick={() =>
                                            setTipoEquipamento(
                                                "CHROMEBOOK"
                                            )
                                        }
                                        disabled={salvando}
                                    >

                                        <Laptop
                                            size={20}
                                        />

                                        <div>

                                            <strong>
                                                Chromebook
                                            </strong>

                                            <span>
                                                {
                                                    disponibilidadeChromebook.disponivel
                                                } disponíveis
                                            </span>

                                        </div>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `tipo-equipamento-opcao ` +
                                            (
                                                tipoEquipamento ===
                                                "TABLET"
                                                    ? "selecionado"
                                                    : ""
                                            )
                                        }
                                        onClick={() =>
                                            setTipoEquipamento(
                                                "TABLET"
                                            )
                                        }
                                        disabled={salvando}
                                    >

                                        <Tablet
                                            size={20}
                                        />

                                        <div>

                                            <strong>
                                                Tablet
                                            </strong>

                                            <span>
                                                {
                                                    disponibilidadeTablet.disponivel
                                                } disponíveis
                                            </span>

                                        </div>

                                    </button>

                                </div>

                            </div>


                            {/* PROFESSOR */}

                            <div className="formulario-campo">

                                <label htmlFor="professor">

                                    Professor

                                    <span>
                                        *
                                    </span>

                                </label>


                                <select
                                    id="professor"
                                    value={
                                        professorSelecionado
                                    }
                                    onChange={(event) =>
                                        setProfessorSelecionado(
                                            event.target.value
                                        )
                                    }
                                    disabled={salvando}
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


                            {/* TURMA */}

                            {finalidade === "AULA" && (

                                <div className="formulario-campo">

                                    <label htmlFor="turma">

                                        Turma

                                        <span>
                                            *
                                        </span>

                                    </label>


                                    <select
                                        id="turma"
                                        value={
                                            turmaSelecionada
                                        }
                                        onChange={(event) =>
                                            setTurmaSelecionada(
                                                event.target.value
                                            )
                                        }
                                        disabled={salvando}
                                    >

                                        <option value="">
                                            Selecione a turma
                                        </option>


                                        {turmas.map(
                                            (turma) => (

                                                <option
                                                    key={
                                                        turma.id
                                                    }
                                                    value={
                                                        turma.id
                                                    }
                                                >

                                                    {
                                                        turma.nome
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            )}


                            {/* QUANTIDADE */}

                            <div className="formulario-campo">

                                <label htmlFor="quantidade">

                                    Quantidade

                                    <span>
                                        *
                                    </span>

                                </label>


                                <input
                                    id="quantidade"
                                    type="number"
                                    min="1"
                                    max={
                                        equipamentoSelecionado.disponivel
                                    }
                                    placeholder="Digite a quantidade"
                                    value={
                                        quantidade
                                    }
                                    onChange={(event) =>
                                        setQuantidade(
                                            event.target.value
                                        )
                                    }
                                    disabled={salvando}
                                />


                                <small>

                                    Disponíveis:
                                    {" "}
                                    <strong>
                                        {
                                            equipamentoSelecionado.disponivel
                                        }
                                    </strong>

                                    {" "}
                                    {
                                        tipoEquipamento ===
                                        "TABLET"
                                            ? "tablets"
                                            : "Chromebooks"
                                    }

                                </small>

                            </div>


                            {/* ERRO DO FORMULÁRIO */}

                            {erroFormulario && (

                                <div className="erro-formulario">

                                    <AlertTriangle
                                        size={17}
                                    />

                                    <span>
                                        {
                                            erroFormulario
                                        }
                                    </span>

                                </div>

                            )}


                            {/* AÇÕES */}

                            <div className="modal-acoes">

                                <button
                                    type="button"
                                    className="botao-cancelar"
                                    onClick={
                                        fecharModal
                                    }
                                    disabled={
                                        salvando
                                    }
                                >

                                    Cancelar

                                </button>


                                <button
                                    type="submit"
                                    className="botao-salvar"
                                    disabled={
                                        salvando
                                    }
                                >

                                    {salvando ? (

                                        <RefreshCw
                                            size={17}
                                            className="girando"
                                        />

                                    ) : (

                                        <Save
                                            size={17}
                                        />

                                    )}

                                    {salvando
                                        ? "Registrando..."
                                        : "Registrar empréstimo"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </main>

    );

}


export default Emprestimos;