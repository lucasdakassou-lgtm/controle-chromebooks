import { useEffect, useState } from "react"
import api from "../../services/api"
import "./Ocorrencias.css"


function Ocorrencias(){
    const [resumo, setResumo] = useState(null)
     // Guarda os empréstimos ativos
    const [ocorrencias, setOcorrencias] = useState([])

    // Texto usado na busca da tabela
    const [busca, setBusca] = useState("")

    // Controle de carregamento e erro da página
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState("")

    // Controla se o modal está aberto
    const [modalAberto, setModalAberto] = useState(false)
    
    // =========================================================
    // ESTADOS DO FORMULÁRIO
    // =========================================================

    // Lista de professores que vem do backend
    const [professores, setProfessores] = useState([])

    // Lista de turmas que vem do backend
    const [turmas, setTurmas] = useState([])

    // Professor escolhido no formulário
    const [professorSelecionado, setProfessorSelecionado] = useState("")

    // Turma escolhida no formulário
    const [turmaSelecionada, setTurmaSelecionada] = useState("")
      // Controle do botão de salvar
    const [salvando, setSalvando] = useState(false)

    // Erro específico do formulário
    const [erroFormulario, setErroFormulario] = useState("")

     useEffect(() => {
        carregarOmprestimos()
    }, [])

    async function carregarOcorrencias() {

        try{
            const TodasOcorrencias = await api.get("ocorrencias")
        
        console.log("[ocorrencias] Ocorrencias recebidas", TodasOcorrencias.data)
                setResumo(TodasOcorrencias.data)
        const OcorrenciasResolvidos = await api.get("ocorrencias/resolver")
        console.log("[resolver] dados recebidos", OcorrenciasResolvidos.data)
        set
        }catch(error){

        }

        
    }

}
