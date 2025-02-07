from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Set, Union

from automata.fa.dfa import DFA
from automata.pda.dpda import DPDA
from automata.tm.dtm import DTM

from fastapi.responses import StreamingResponse

from typing import Dict, Set, Union, Optional
from flask_cors import CORS
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DTM API",
    description="API para criar e validar Máquinas de Turing Determinísticas (DTM)",
    version="1.0.0",
    docs_url="/docs", 
    redoc_url="/redoc" 
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens (ajuste conforme necessário)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os headers
)


class AutomataValidationRequest(BaseModel):
    states: Optional[Set[str]] = None
    input_symbols: Optional[Set[str]] = None
    transitions: Optional[Dict] = None
    initial_state: Optional[str] = None
    final_states: Optional[Set[str]] = None
    stack_symbols: Optional[Set[str]] = None
    initial_stack_symbol: Optional[str] = None
    acceptance_mode: Optional[str] = 'final_state'
    tape_symbols: Optional[Set[str]] = None
    blank_symbol: Optional[str] = '.'
    input_string: str  

# DFA = deterministic finite automata
@app.post("/dfa/validate")
def validate_dfa(request: AutomataValidationRequest):
    try:
        # Create DFA
        dfa = DFA(
            states=request.states,
            input_symbols=request.input_symbols,
            transitions=request.transitions,
            initial_state=request.initial_state,
            final_states=request.final_states
        )
        
        # Validate input
        is_accepted = dfa.accepts_input(request.input_string)
        
        return {
            "input": request.input_string, 
            "accepted": is_accepted,
            "automaton_details": {
                "total_states": len(dfa.states),
                "input_symbols": list(dfa.input_symbols),
                "initial_state": dfa.initial_state,
                "final_states": list(dfa.final_states)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def convert_transitions(transitions):
    return {
        state: {
            symbol: {
                stack: (value[0], tuple(value[1])) 
                for stack, value in stack_trans.items()
            }
            for symbol, stack_trans in trans.items()
        }
        for state, trans in transitions.items()
    }

# DPDA = deterministic pushdown automata
@app.post("/dpda/validate")
def validate_dpda(request: AutomataValidationRequest):
    try:
        dpda = DPDA(
            states=request.states,
            input_symbols=request.input_symbols,
            stack_symbols=request.stack_symbols,
            transitions=convert_transitions(request.transitions),  # Usando a função para conversão
            initial_state=request.initial_state,
            initial_stack_symbol=request.initial_stack_symbol,
            final_states=request.final_states,
            acceptance_mode=request.acceptance_mode
        )
        
        is_accepted = dpda.accepts_input(request.input_string)
        
        return {
            "input": request.input_string, 
            "accepted": is_accepted,
            "automaton_details": {
                "total_states": len(dpda.states),
                "input_symbols": list(dpda.input_symbols),
                "initial_state": dpda.initial_state,
                "final_states": list(dpda.final_states)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def convert_dtm_transitions(transitions):
    return {
        state: {
            symbol: tuple(value)  # Transforma as listas em tuplas
            for symbol, value in stack_trans.items()
        }
        for state, stack_trans in transitions.items()
    }

# DTM = deterministic Turing machine
@app.post("/dtm/validate")
def validate_dtm(request: AutomataValidationRequest):
    try:
        dtm = DTM(
            states=request.states,
            input_symbols=request.input_symbols,
            tape_symbols=request.tape_symbols,
            transitions=convert_dtm_transitions(request.transitions),  # Usando a função para conversão
            initial_state=request.initial_state,
            blank_symbol=request.blank_symbol,
            final_states=request.final_states
        )
        
        # Validar a entrada
        is_accepted = dtm.accepts_input(request.input_string)
        
        return {
            "input": request.input_string, 
            "accepted": is_accepted,
            "automaton_details": {
                "total_states": len(dtm.states),
                "input_symbols": list(dtm.input_symbols),
                "initial_state": dtm.initial_state,
                "final_states": list(dtm.final_states)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)