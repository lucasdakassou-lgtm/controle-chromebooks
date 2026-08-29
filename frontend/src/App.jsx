import "./App.css"

function App() {
  return (
    <div className="sistema">

      {/* Menu lateral */}
      <aside className="menu">

        <h1 className="titulo">
          💻 Chromebooks
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

        </nav>

      </aside>


      {/* Conteúdo */}
      <main className="conteudo">

        <h2 className="titulo-pagina">
          Dashboard
        </h2>

        <p className="descricao">
          Controle dos Chromebooks da escola
        </p>

      </main>

    </div>
  )
}

export default App