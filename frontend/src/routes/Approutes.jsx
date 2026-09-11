import { useState } from "react"
import Dashboard from "../pages/Dashboard/Dashboard"
import Emprestimos from "../pages/Emprestimos/Emprestimos"

function AppRoutes({ pagina }) {
    if (pagina === "emprestimos") {
        return <Emprestimos />
    }

    return <Dashboard />
}

export default AppRoutes