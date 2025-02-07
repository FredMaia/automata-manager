import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Importa o arquivo CSS

const App: React.FC = () => {
  const [automatonType, setAutomatonType] = useState("dfa");

  // Estados para os inputs gerais
  const [states, setStates] = useState("");
  const [inputSymbols, setInputSymbols] = useState("");
  const [initialState, setInitialState] = useState("");
  const [finalStates, setFinalStates] = useState("");
  const [inputString, setInputString] = useState("");

  // Estado para transições
  const [transitions, setTransitions] = useState<{ [key: string]: { [key: string]: string } }>({});

  const handleAddTransition = () => {
    const state = prompt("Estado atual:");
    const symbol = prompt("Símbolo de entrada:");
    const nextState = prompt("Próximo estado:");

    if (state && symbol && nextState) {
      setTransitions((prev) => ({
        ...prev,
        [state]: {
          ...(prev[state] || {}),
          [symbol]: nextState,
        },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const jsonData: any = {
        states: states.split(",").map((s) => s.trim()),
        input_symbols: inputSymbols.split(",").map((s) => s.trim()),
        transitions,
        initial_state: initialState.trim(),
        final_states: finalStates.split(",").map((s) => s.trim()),
        input_string: inputString.trim(),
      };

      if (automatonType === "dpda") {
        jsonData["stack_symbols"] = ["0", "1"];
        jsonData["initial_stack_symbol"] = "0";
        jsonData["acceptance_mode"] = "final_state";
      } else if (automatonType === "dtm") {
        jsonData["tape_symbols"] = ["0", "1", "x", "y", "."];
        jsonData["blank_symbol"] = ".";
      }

      const res = await axios.post(`http://127.0.0.1:8000/${automatonType}/validate`, jsonData);
      alert("Resposta:\n" + JSON.stringify(res.data, null, 2));
    } catch (error) {
      alert("Erro ao enviar requisição. Verifique os dados.");
      console.log(error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Validação de Autômatos</h2>

        <label>
          Tipo de Autômato:
          <select value={automatonType} onChange={(e) => setAutomatonType(e.target.value)}>
            <option value="dfa">DFA</option>
            <option value="dpda">DPDA</option>
            <option value="dtm">DTM</option>
          </select>
        </label>

        <h3>Configuração</h3>
        
        <div className="input-grid">
          <input
            type="text"
            placeholder="Estados (ex: q0, q1, q2)"
            value={states}
            onChange={(e) => setStates(e.target.value)}
          />
          <input
            type="text"
            placeholder="Símbolos de Entrada (ex: 0,1)"
            value={inputSymbols}
            onChange={(e) => setInputSymbols(e.target.value)}
          />
          <input
            type="text"
            placeholder="Estado Inicial (ex: q0)"
            value={initialState}
            onChange={(e) => setInitialState(e.target.value)}
          />
          <input
            type="text"
            placeholder="Estados Finais (ex: q1,q2)"
            value={finalStates}
            onChange={(e) => setFinalStates(e.target.value)}
          />
          <input
            type="text"
            placeholder="String de Entrada (ex: 0110)"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
          />
        </div>

        <h3>Transições</h3>
        
        <button onClick={handleAddTransition} className="add-transition">Adicionar Transição</button>

        <button onClick={handleSubmit} className="submit-button">Validar Autômato</button>
      </div>
    </div>
  );
};

export default App;
