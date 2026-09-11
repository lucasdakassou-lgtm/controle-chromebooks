import { useEffect, useState } from "react"
import Menu from "./components/Menu/Menu"
import Dashboard from "./pages/Dashboard/Dashboard"
function App() {
    const [modoEscuro, setModoEscuro] = useState(() => {
        return localStorage.getItem("modo") === "escuro"
    })

    useEffect(() => {
        if (modoEscuro) {
            document.body.classList.add("modo-escuro")
            localStorage.setItem("modo", "escuro")
        } else {
            document.body.classList.remove("modo-escuro")
            localStorage.setItem("modo", "claro")
        }
    }, [modoEscuro])

    function mudarTema() {
        setModoEscuro((temaAtual) => !temaAtual)
    }

    return (
        <div className="sistema">
            <Menu
                modoEscuro={modoEscuro}
                mudarTema={mudarTema}
            />

         <main className="conteudo">
    <Dashboard />
</main>
        </div>
    )
}

export default App