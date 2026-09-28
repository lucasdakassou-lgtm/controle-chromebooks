import Dashboard from "../pages/Dashboard/Dashboard"
import Emprestimos from "../pages/Emprestimos/Emprestimos"
import Professores from "../pages/Professores/Professores"
import Turmas from "../pages/Turmas/Turmas"
import Ocorrencias from "../pages/Ocorrencias/Ocorrencias"
import Agendamento from "../pages/Agendamentos/Agendamentos"
import Relatorios from "../pages/Relatorios/Relatorios"

function AppRoutes({ pagina }) {

    if (pagina === "emprestimos") {
        return <Emprestimos />
    }

    if (pagina === "professores") {
        return <Professores />
    }

    if (pagina === "turmas") {
        return <Turmas />
    }

    if (pagina === "ocorrencias") {
        return <Ocorrencias />
    }
    if (pagina === "agendamentos"){
        return <Agendamento/>
    }
    if (pagina === "relatorios"){
        return <Relatorios/>
    }
    return <Dashboard />
}

export default AppRoutes