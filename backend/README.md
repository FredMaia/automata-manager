# API REST para implementar autômatos

## Como configurar e executar o projeto.

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Rotas

- http://127.0.0.1:8000/dfa/validate
- http://127.0.0.1:8000/dpda/validate
- http://127.0.0.1:8000/dtm/validate

- http://127.0.0.1:8000/dfa/docs
- http://127.0.0.1:8000/dfa/redoc

## Exemplos de uso da API.

### DFA: determinitic finite automata

Entrada para `/dfa/validate`

```json
{
    "states": ["q0", "q1", "q2"],
    "input_symbols": ["0", "1"],
    "transitions": {
        "q0": {"0": "q0", "1": "q1"},
        "q1": {"0": "q0", "1": "q2"},
        "q2": {"0": "q2", "1": "q1"}
    },
    "initial_state": "q0",
    "final_states": ["q1"],
	"input_string": "aab"
}
```

Resposta: 

```json
{
	"input": "aab",
	"accepted": false,
	"automaton_details": {
		"total_states": 3,
		"input_symbols": [
			"0",
			"1"
		],
		"initial_state": "q0",
		"final_states": [
			"q1"
		]
	}
}
```

### DPDA: deterministic pushdown automata

Entrada para `/dpda/validate`

```json
{
    "states": ["q0", "q1", "q2", "q3"],
    "input_symbols": ["a", "b"],
    "stack_symbols": ["0", "1"],
    "transitions": {
      "q0": {
        "a": {
          "0": ["q1", ["1", "0"]]
        }
      },
      "q1": {
        "a": {
          "1": ["q1", ["1", "1"]]
        },
        "b": {
          "1": ["q2", []]
        }
      },
      "q2": {
        "b": {
          "1": ["q2", []]
        },
        "": {
          "0": ["q3", ["0"]]
        }
      }
    },
    "initial_state": "q0",
    "initial_stack_symbol": "0",
    "final_states": ["q3"],
    "acceptance_mode": "final_state",
    "input_string": "aabb"
}
```

Resposta: 

```json
{
	"input": "aabb",
	"accepted": true,
	"automaton_details": {
		"total_states": 4,
		"input_symbols": [
			"b",
			"a"
		],
		"initial_state": "q0",
		"final_states": [
			"q3"
		]
	}
}
```


### DTM: deterministic turing machine

Entrada para `/dtm/validate`

```json
{
	"input_string": "01",
    "states": ["q0", "q1", "q2", "q3", "q4"],
    "input_symbols": ["0", "1"],
    "tape_symbols": ["0", "1", "x", "y", "."],
    "transitions": {
        "q0": {
            "0": ["q1", "x", "R"],
            "y": ["q3", "y", "R"]
        },
        "q1": {
            "0": ["q1", "0", "R"],
            "1": ["q2", "y", "L"],
            "y": ["q1", "y", "R"]
        },
        "q2": {
            "0": ["q2", "0", "L"],
            "x": ["q0", "x", "R"],
            "y": ["q2", "y", "L"]
        },
        "q3": {
            "y": ["q3", "y", "R"],
            ".": ["q4", ".", "R"]
        }
    },
    "initial_state": "q0",
    "blank_symbol": ".",
    "final_states": ["q4"]
}
```

Resposta:

```json
{
	"input": "01",
	"accepted": true,
	"automaton_details": {
		"total_states": 5,
		"input_symbols": [
			"0",
			"1"
		],
		"initial_state": "q0",
		"final_states": [
			"q4"
		]
	}
}
```


