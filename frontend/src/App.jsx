import { useEffect, useState } from "react"
import Menu from "./components/Menu/Menu"
import Dashboard from "./pages/Dashboard/Dashboard"

function App() {
    const [modoEscuro, setModoEscuro] = useState(() => {
        return localStorage.getItem("modo") === "escuro"
    })

    const [menuAberto, setMenuAberto] = useState(true)

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

    function mudarMenu() {
        setMenuAberto((estadoAtual) => !estadoAtual)
    }

    return (
        <div className="sistema">
            <Menu
                modoEscuro={modoEscuro}
                mudarTema={mudarTema}
                aberto={menuAberto}
                mudarMenu={mudarMenu}
            />

            <main
                className={`conteudo ${
                    menuAberto ? "conteudo-menu-aberto" : "conteudo-menu-fechado"
                }`}
            >
                <Dashboard />
            </main>
        </div>
    )
}

export default App