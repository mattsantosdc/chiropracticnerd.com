"""Run the foundation pilot, emitting a reproducible report only on full success."""
import argparse
import json
import sys
from pathlib import Path

from engine import IncompleteEvaluation, InvalidTheory, evaluate, to_aif, from_aif
from model import load_model, pilot


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, help='Directory for generated reports; omitted means stdout')
    args = parser.parse_args()
    theories = [pilot('ARG-007'), pilot('ARG-002'), load_model()]
    results = []
    for theory in theories:
        result = evaluate(theory)
        aif = to_aif(theory)
        if evaluate(from_aif(aif)) != result:
            raise InvalidTheory('Interchange changed evaluation')
        results.append(result)
    # Nothing is written until all theories have completed successfully.
    if args.output:
        args.output.mkdir(parents=True, exist_ok=True)
        for theory, result in zip(theories, results):
            (args.output / (theory['id'] + '.json')).write_text(json.dumps(result, indent=2) + '\n')
            (args.output / (theory['id'] + '.aif.json')).write_text(json.dumps(to_aif(theory), indent=2) + '\n')
        print(json.dumps({'complete': True, 'theories': [r['theory'] for r in results],
                          'arguments': [len(r['arguments']) for r in results],
                          'strictProofs': [r['strictProofs'] for r in results]}))
    else:
        print(json.dumps(results, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (IncompleteEvaluation, InvalidTheory) as error:
        print(json.dumps({'complete': False, 'error': str(error)}), file=sys.stderr)
        sys.exit(1)
