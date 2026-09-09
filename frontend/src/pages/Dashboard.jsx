import { useEffect, useState } from "react"
import api from "../services/api"

function Dashboard() {

  const [resumo, setResumo] = useState(null)
  const [ranking, setRanking] = useState([])
  const [salas, setSalas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {

    const carregarDados = async () => {

      try {

        const respostaResumo = await api.get("/relatorios/resumo")
        const respostaRanking = await api.get("/relatorios/ranking-professores")
        const respostaSalas = await api.get("/relatorios/ocorrencias-salas")

        setResumo(respostaResumo.data.dados)
        setRanking(respostaRanking.data.dados)
        setSalas(respostaSalas.data.dados)

      } catch (erro) {

        console.error("Erro ao carregar dashboard:", erro)

      } finally {

        setCarregando(false)

      }
    }

    carregarDados()

  }, [])


  if (carregando) {
    return <p>Carregando dashboard...</p>
  }


  return (
    <div className="dashboard">

      <div className="cabecalho-dashboard">
        <h2>Dashboard</h2>

        <p>
          Controle dos Chromebooks da escola
        </p>
      </div>


      {/* CARDS */}

      <div className="cards">

        <div className="card">
          <span>💻</span>
          <h3>Chromebooks</h3>
          <strong>{resumo?.total_chromebooks}</strong>
          <p>Total</p>
        </div>


        <div className="card">
          <span>🟢</span>
          <h3>Disponíveis</h3>
          <strong>{resumo?.chromebooks_disponiveis}</strong>
          <p>Disponíveis agora</p>
        </div>


        <div className="card">
          <span>🔴</span>
          <h3>Emprestados</h3>
          <strong>{resumo?.chromebooks_emprestados}</strong>
          <p>Em uso agora</p>
        </div>


        <div className="card">
          <span>⚠️</span>
          <h3>Ocorrências</h3>
          <strong>{resumo?.total_ocorrencias}</strong>
          <p>Total registradas</p>
        </div>

      </div>


      {/* SEGUNDA LINHA */}

      <div className="area-relatorios">


        {/* RANKING */}

        <div className="painel">

          <h3>🏆 Professores que mais utilizam</h3>

          {ranking.length === 0 ? (

            <p>Nenhum empréstimo registrado.</p>

          ) : (

            ranking.slice(0, 5).map((professor, index) => (

              <div className="linha-ranking" key={professor.id}>

                <span>
                  {index + 1}º
                </span>

                <strong>
                  {professor.nome}
                </strong>

                <small>
                  {professor.total_chromebooks} Chromebooks
                </small>

              </div>

            ))

          )}

        </div>


        {/* SALAS */}

        <div className="painel">

          <h3>🏫 Salas com mais ocorrências</h3>

          {salas.length === 0 ? (

            <p>Nenhuma ocorrência registrada.</p>

          ) : (

            salas.slice(0, 5).map((sala, index) => (

              <div className="linha-ranking" key={sala.sala}>

                <span>
                  {index + 1}º
                </span>

                <strong>
                  {sala.sala}
                </strong>

                <small>
                  {sala.total_ocorrencias} ocorrências
                </small>

              </div>

            ))

          )}

        </div>


      </div>


      {/* STATUS DAS OCORRÊNCIAS */}

      <div className="painel painel-status">

        <h3>📊 Status das ocorrências</h3>

        <div className="status-container">

          <div>
            <strong>{resumo?.ocorrencias_abertas}</strong>
            <span>🔴 Abertas</span>
          </div>

          <div>
            <strong>{resumo?.ocorrencias_em_andamento}</strong>
            <span>🟡 Em andamento</span>
          </div>

          <div>
            <strong>{resumo?.ocorrencias_resolvidas}</strong>
            <span>🟢 Resolvidas</span>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard