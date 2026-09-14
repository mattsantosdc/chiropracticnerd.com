"""Explicit what-if challenges to the full working theory, never silent adoption."""
import copy
import json
import re

from engine import ROOT, InvalidTheory, exact_keys, validate
from model import load_model

PATH = ROOT / 'reasoning/opposition-scenarios.json'
STATUSES = {'accepted-support', 'unresolved-support', 'rejected-support', 'no-argument'}


def load_opposition_scenarios():
    data = json.loads(PATH.read_text())
    exact_keys(data, ['schemaVersion', 'scenarios'])
    if data['schemaVersion'] != 1 or not isinstance(data['scenarios'], list):
        raise InvalidTheory('Unsupported opposition scenario schema')
    base = load_model()
    statement_ids = {s['id'] for s in base['statements']}
    literal_ids = statement_ids | {'-' + sid for sid in statement_ids}
    rule_ids = {r['id'] for r in base['rules']}
    question_ids = {q['id'] for q in json.loads((ROOT / 'src/data/model-questions.json').read_text())}
    seen = set()
    result = []
    for scenario in data['scenarios']:
        exact_keys(scenario, ['id', 'role', 'description', 'targets', 'questions',
                              'removePremises', 'addPremises', 'undercutters', 'expectedStatuses'])
        sid = scenario['id']
        if not isinstance(sid, str) or not re.fullmatch(r'OP-\d{3}', sid) or sid in seen:
            raise InvalidTheory('Invalid or duplicate opposition scenario identity')
        seen.add(sid)
        if scenario['role'] != 'hypothetical' or not isinstance(scenario['description'], str) or not scenario['description'].strip():
            raise InvalidTheory('Opposition scenarios must be explicitly hypothetical and explained')
        for field, allowed in [('targets', statement_ids | rule_ids), ('questions', question_ids),
                               ('removePremises', set(base['ordinaryPremises'])), ('addPremises', literal_ids)]:
            values = scenario[field]
            if not isinstance(values, list) or any(not isinstance(v, str) for v in values) or len(set(values)) != len(values) or not set(values) <= allowed:
                raise InvalidTheory(f'{sid}: invalid {field}')
        if not scenario['targets'] or not scenario['questions']:
            raise InvalidTheory(f'{sid}: targets and questions are required')
        if set(scenario['removePremises']) & set(scenario['addPremises']):
            raise InvalidTheory(f'{sid}: premise cannot be removed and added')
        theory = copy.deepcopy(base)
        theory['id'] = 'opposition-' + sid
        theory['ordinaryPremises'] = [p for p in theory['ordinaryPremises'] if p not in scenario['removePremises']]
        theory['ordinaryPremises'] += scenario['addPremises']
        if not isinstance(scenario['undercutters'], list):
            raise InvalidTheory(f'{sid}: undercutters must be a list')
        for objection in scenario['undercutters']:
            exact_keys(objection, ['id', 'text', 'rule'])
            oid = objection['id']
            if not isinstance(oid, str) or not re.fullmatch(r'H-\d{3}', oid):
                raise InvalidTheory(f'{sid}: invalid hypothetical premise identity')
            if not isinstance(objection['rule'], str) or objection['rule'] not in rule_ids:
                raise InvalidTheory(f'{sid}: invalid undercut rule')
            theory['signature'] += f'\n(declare-fun {oid} () Bool)'
            theory['statements'].append(dict(id=oid, text=objection['text'], formula=oid, role='hypothetical'))
            theory['ordinaryPremises'].append(oid)
            theory['undercutters'].append(dict(statement=oid, rule=objection['rule']))
        expected = scenario['expectedStatuses']
        if not isinstance(expected, dict) or not expected or not set(expected) <= literal_ids or any(not isinstance(v, str) or v not in STATUSES for v in expected.values()):
            raise InvalidTheory(f'{sid}: invalid expected statuses')
        validate(theory)
        result.append((scenario, theory))
    return result


def check_expectations(scenario, evaluation):
    for sid, expected in scenario['expectedStatuses'].items():
        actual = evaluation['statements'][sid]['status']
        if actual != expected:
            raise InvalidTheory(f"{scenario['id']}: {sid} expected {expected}, received {actual}")
