import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App: React.FC = () => {
  const [automatonType, setAutomatonType] = useState("dfa");

  // Common fields
  const [states, setStates] = useState("");
  const [inputSymbols, setInputSymbols] = useState("");
  const [initialState, setInitialState] = useState("");
  const [finalStates, setFinalStates] = useState("");
  const [inputString, setInputString] = useState("");

  // DPDA specific fields
  const [stackSymbols, setStackSymbols] = useState("");
  const [initialStackSymbol, setInitialStackSymbol] = useState("");
  const [acceptanceMode, setAcceptanceMode] = useState("final_state");

  // DTM specific fields
  const [tapeSymbols, setTapeSymbols] = useState("");
  const [blankSymbol, setBlankSymbol] = useState(".");

  const [transitions, setTransitions] = useState<{ [key: string]: any }>({});
  const [transitionDisplay, setTransitionDisplay] = useState<string[]>([]);

  const handleAddTransition = () => {
    switch (automatonType) {
      case "dfa":
        addDFATransition();
        break;
      case "dpda":
        addDPDATransition();
        break;
      case "dtm":
        addDTMTransition();
        break;
    }
  };

  const addDFATransition = () => {
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

      setTransitionDisplay((prev) => [
        ...prev,
        `δ(${state}, ${symbol}) = ${nextState}`,
      ]);
    }
  };

  const addDPDATransition = () => {
    const state = prompt("Estado atual:");
    const symbol = prompt("Símbolo de entrada:");
    const stackTop = prompt("Símbolo no topo da pilha:");
    const nextState = prompt("Próximo estado:");
    const stackReplace = prompt("Símbolos a empilhar (separados por vírgula):");

    if (state && symbol && stackTop && nextState && stackReplace) {
      setTransitions((prev) => ({
        ...prev,
        [state]: {
          ...(prev[state] || {}),
          [symbol]: {
            ...(prev[state]?.[symbol] || {}),
            [stackTop]: [nextState, stackReplace.split(",")],
          },
        },
      }));

      setTransitionDisplay((prev) => [
        ...prev,
        `δ(${state}, ${symbol}, ${stackTop}) = (${nextState}, [${stackReplace}])`,
      ]);
    }
  };

  const addDTMTransition = () => {
    const state = prompt("Estado atual:");
    const symbol = prompt("Símbolo na fita:");
    const nextState = prompt("Próximo estado:");
    const newSymbol = prompt("Novo símbolo na fita:");
    const direction = prompt("Direção (L/R):");

    if (state && symbol && nextState && newSymbol && direction) {
      setTransitions((prev) => ({
        ...prev,
        [state]: {
          ...(prev[state] || {}),
          [symbol]: [nextState, newSymbol, direction],
        },
      }));

      setTransitionDisplay((prev) => [
        ...prev,
        `δ(${state}, ${symbol}) = (${nextState}, ${newSymbol}, ${direction})`,
      ]);
    }
  };

  const clearTransitions = () => {
    setTransitions({});
    setTransitionDisplay([]);
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

      switch (automatonType) {
        case "dpda":
          jsonData["stack_symbols"] = stackSymbols
            .split(",")
            .map((s) => s.trim());
          jsonData["initial_stack_symbol"] = initialStackSymbol;
          jsonData["acceptance_mode"] = acceptanceMode;
          break;
        case "dtm":
          jsonData["tape_symbols"] = tapeSymbols
            .split(",")
            .map((s) => s.trim());
          jsonData["blank_symbol"] = blankSymbol;
          break;
      }

      const res = await axios.post(
        `http://127.0.0.1:8000/${automatonType}/validate`,
        jsonData
      );
      alert("Resposta:\n" + JSON.stringify(res.data, null, 2));
    } catch (error) {
      alert("Erro ao enviar requisição. Verifique os dados.");
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Validação de Autômatos</h2>

        <label>
          Tipo de Autômato:
          <select
            value={automatonType}
            onChange={(e) => {
              setAutomatonType(e.target.value);
              setTransitions({});
              setTransitionDisplay([]);
            }}
          >
            <option value="dfa">DFA</option>
            <option value="dpda">DPDA</option>
            <option value="dtm">DTM</option>
          </select>
        </label>

        <h3>Configuração Básica</h3>

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

        {/* DPDA Specific Inputs */}
        {automatonType === "dpda" && (
          <div className="dpda-specific input-grid">
            <h3>Configurações DPDA</h3> <br />
            <input
              type="text"
              placeholder="Símbolos de Pilha (ex: 0,1)"
              value={stackSymbols}
              onChange={(e) => setStackSymbols(e.target.value)}
            />
            <input
              type="text"
              placeholder="Símbolo Inicial da Pilha"
              value={initialStackSymbol}
              onChange={(e) => setInitialStackSymbol(e.target.value)}
            />
            <select
              value={acceptanceMode}
              onChange={(e) => setAcceptanceMode(e.target.value)}
            >
              <option value="final_state">Estado Final</option>
              <option value="empty_stack">Pilha Vazia</option>
            </select>
          </div>
        )}

        {/* DTM Specific Inputs */}
        {automatonType === "dtm" && (
          <div className="dtm-specific input-grid">
            <h3>Configurações DTM</h3> <br />
            <input
              type="text"
              placeholder="Símbolos de Fita (ex: 0,1,x,y,.)"
              value={tapeSymbols}
              onChange={(e) => setTapeSymbols(e.target.value)}
            />
            <input
              type="text"
              placeholder="Símbolo em Branco"
              value={blankSymbol}
              onChange={(e) => setBlankSymbol(e.target.value)}
            />
          </div>
        )}

        <h3>Transições</h3>

        <button onClick={handleAddTransition} className="add-transition">
          Adicionar Transição
        </button>

        <button onClick={clearTransitions} className="clear-transition">
          Limpar Transições
        </button>

        {transitionDisplay.length > 0 && (
          <div className="transitions-list">
            <h4>Transições Adicionadas:</h4>
            {transitionDisplay.map((transition, index) => (
              <div key={index} className="transition-item">
                {transition}
              </div>
            ))}
          </div>
        )}

        <br />
        <br />
        
        <button onClick={handleSubmit} className="submit-button">
          Validar Autômato
        </button>
      </div>
    </div>
  );
};

export default App;
