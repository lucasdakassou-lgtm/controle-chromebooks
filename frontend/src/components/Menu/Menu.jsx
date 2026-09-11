import {
    LayoutDashboard,
    Laptop,
    CalendarDays,
    Users,
    GraduationCap,
    AlertTriangle,
    BarChart3,
    Sun,
    Moon
} from "lucide-react"

import "./Menu.css"

function Menu({ modoEscuro, mudarTema }) {
    return (
        <aside className="menu">

            <div className="menu-titulo">
                <Laptop size={24} />
                <span>SistemaProati</span>
            </div>

            <nav className="menu-navegacao">

                <a href="#" className="menu-link menu-link-ativo">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </a>

                <a href="#" className="menu-link">
                    <Laptop size={20} />
                    <span>Empréstimos</span>
                </a>

                <a href="#" className="menu-link">
                    <CalendarDays size={20} />
                    <span>Agendamentos</span>
                </a>

                <a href="#" className="menu-link">
                    <Users size={20} />
                    <span>Professores</span>
                </a>

                <a href="#" className="menu-link">
                    <GraduationCap size={20} />
                    <span>Turmas</span>
                </a>

                <a href="#" className="menu-link">
                    <AlertTriangle size={20} />
                    <span>Ocorrências</span>
                </a>

                <a href="#" className="menu-link">
                    <BarChart3 size={20} />
                    <span>Relatórios</span>
                </a>

            </nav>

            <div className="menu-final">

                <button
                    className="menu-tema"
                    onClick={mudarTema}
                >
                    {modoEscuro ? (
                        <>
                            <Sun size={20} />
                            <span>Modo claro</span>
                        </>
                    ) : (
                        <>
                            <Moon size={20} />
                            <span>Modo escuro</span>
                        </>
                    )}
                </button>

            </div>

        </aside>
    )
}

export default Menu