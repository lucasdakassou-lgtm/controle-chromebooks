import "./App.css"
import Dashboard from "./pages/Dashboard"

function App() {

  return (
    <div className="sistema">

      {/* MENU LATERAL */}

      <aside className="menu">

        <h1 className="titulo">
          💻 SistemaProati
        </h1>

        <nav className="navegacao">

          <button className="botao-menu">
            🏠 Dashboard
          </button>

          <button className="botao-menu">
            💻 Empréstimos
          </button>

          <button className="botao-menu">
            📅 Agendamentos
          </button>

          <button className="botao-menu">
            👨‍🏫 Professores
          </button>

          <button className="botao-menu">
            🏫 Turmas
          </button>

          <button className="botao-menu">
            ⚠️ Ocorrências
          </button>

          <button className="botao-menu">
            📊 Relatórios
          </button>

        </nav>

      </aside>


      {/* CONTEÚDO */}

      <main className="conteudo">

        <Dashboard />

      </main>

    </div>
  )
}

export default App