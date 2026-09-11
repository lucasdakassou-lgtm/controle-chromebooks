import { useEffect, useState } from "react"
import Menu from "./components/Menu/Menu"
import AppRoutes from "./routes/Approutes"

function App() {
    const [modoEscuro, setModoEscuro] = useState(() => {
        return localStorage.getItem("modo") === "escuro"
    })

    const [menuAberto, setMenuAberto] = useState(true)
    const [pagina, setPagina] = useState("dashboard")

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
                pagina={pagina}
                mudarPagina={setPagina}
            />

            <main
                className={`conteudo ${
                    menuAberto
                        ? "conteudo-menu-aberto"
                        : "conteudo-menu-fechado"
                }`}
            >
                <AppRoutes pagina={pagina} />
            </main>
        </div>
    )
}

export default App