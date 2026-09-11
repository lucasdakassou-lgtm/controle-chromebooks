import {
    LayoutDashboard,
    Laptop,
    CalendarDays,
    Users,
    GraduationCap,
    AlertTriangle,
    BarChart3,
    Sun,
    Moon,
    ChevronsRight
} from "lucide-react"

import "./Menu.css"

function Menu({
    modoEscuro,
    mudarTema,
    aberto,
    mudarMenu,
    pagina,
    mudarPagina
}) {
   

    return (
        <aside className={`menu ${aberto ? "menu-aberto" : "menu-fechado"}`}>

            <div className="menu-cabecalho">

                <div className="menu-marca">
                    <div className="menu-logo">
                        <Laptop size={21} />
                    </div>

                    {aberto && (
                        <div>
                            <strong>SistemaProati</strong>
                            <span>Gestão escolar</span>
                        </div>
                    )}
                </div>

            </div>

            <nav className="menu-navegacao">

             <button
    className={`menu-link ${
        pagina === "dashboard" ? "menu-link-ativo" : ""
    }`}
    onClick={() => mudarPagina("dashboard")}
>
    <LayoutDashboard size={20} />
    {aberto && <span>Dashboard</span>}
</button>
              <button
    className={`menu-link ${
        pagina === "emprestimos" ? "menu-link-ativo" : ""
    }`}
    onClick={() => mudarPagina("emprestimos")}
>
    <Laptop size={20} />
    {aberto && <span>Empréstimos</span>}
</button>

                <a href="#" className="menu-link">
                    <CalendarDays size={20} />

                    {aberto && (
                        <span>Agendamentos</span>
                    )}
                </a>

                <a href="#" className="menu-link">
                    <Users size={20} />

                    {aberto && (
                        <span>Professores</span>
                    )}
                </a>

                <a href="#" className="menu-link">
                    <GraduationCap size={20} />

                    {aberto && (
                        <span>Turmas</span>
                    )}
                </a>

                <a href="#" className="menu-link">
                    <AlertTriangle size={20} />

                    {aberto && (
                        <span>Ocorrências</span>
                    )}
                </a>

                <a href="#" className="menu-link">
                    <BarChart3 size={20} />

                    {aberto && (
                        <span>Relatórios</span>
                    )}
                </a>

            </nav>

            <div className="menu-final">

                <button
                    className="menu-tema"
                    onClick={mudarTema}
                    title={aberto ? "" : "Alterar tema"}
                >
                    {modoEscuro ? (
                        <Sun size={20} />
                    ) : (
                        <Moon size={20} />
                    )}

                    {aberto && (
                        <span>
                            {modoEscuro ? "Modo claro" : "Modo escuro"}
                        </span>
                    )}
                </button>

               <button
    className="menu-recolher"
    onClick={mudarMenu}
    title={aberto ? "Recolher menu" : "Expandir menu"}
>
    <ChevronsRight
        size={20}
        className={aberto ? "menu-seta-aberta" : ""}
    />

    {aberto && <span>Recolher menu</span>}
</button>


            </div>

        </aside>
    )
}


export default Menu