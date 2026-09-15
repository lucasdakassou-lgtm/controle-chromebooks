import { useState } from "react"
import Dashboard from "../pages/Dashboard/Dashboard"
import Emprestimos from "../pages/Emprestimos/Emprestimos"
import Professores from "../pages/Professores/Professores"
import Turmas from "../pages/Turmas/Turmas"
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

    return <Dashboard />
}

export default AppRoutes