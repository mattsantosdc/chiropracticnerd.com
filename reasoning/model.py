"""Bind the pilot to exact canonical Markdown without adding any implicit premises."""
import hashlib
import json
import re
from pathlib import Path

import yaml

from engine import ROOT, InvalidTheory, PROFILE, exact_keys, validate


def markdown_records(directory):
    result = {}
    paths = (path for path in (ROOT / directory).rglob('*')
             if path.is_file() and path.suffix in ('.md', '.mdx'))
    for path in sorted(paths):
        text = path.read_text()
        data = yaml.safe_load(text.split('---', 2)[1])
        if data['id'] in result:
            raise InvalidTheory('Duplicate canonical ID')
        result[data['id']] = (data, path.relative_to(ROOT).as_posix(),
                              hashlib.sha256(text.encode()).hexdigest())
    return result


def load_model():
    config = json.loads((ROOT / 'reasoning/model-bindings.json').read_text())
    exact_keys(config, ['schemaVersion', 'signature', 'ordinaryPremises', 'statements', 'applications'])
    if config['schemaVersion'] != 1:
        raise InvalidTheory('Unknown formal-binding schema')
    statements = markdown_records('src/content/model/statements')
    arguments = markdown_records('src/content/model/arguments')
    if set(config['statements']) != set(statements):
        raise InvalidTheory('Canonical statement inventory changed; review formal bindings explicitly')
    if set(config['applications']) != set(arguments):
        raise InvalidTheory('Canonical argument inventory changed; review formal applications explicitly')
    bound = []
    for sid, binding in config['statements'].items():
        exact_keys(binding, ['text', 'formula', 'representation'])
        if binding['representation'] not in ('opaque-proposition', 'quantified-pilot'):
            raise InvalidTheory(f'{sid}: unknown formal representation')
        data, path, fingerprint = statements[sid]
        if binding['text'] != data['statement']:
            raise InvalidTheory(f'{sid}: wording changed; review its formal representation before evaluation')
        bound.append(dict(id=sid, text=data['statement'], formula=binding['formula'],
                          role='working-claim', source=dict(path=path, sha256=fingerprint)))
    rules = []
    for rid, binding in config['applications'].items():
        data, path, fingerprint = arguments[rid]
        expected = {k: data[k] for k in ['premises', 'conclusion', 'inferenceKind', 'scheme']}
        if binding != expected:
            raise InvalidTheory(f'{rid}: canonical inference changed; review its formal application')
        rules.append(dict(id=rid, premises=data['premises'], conclusion=data['conclusion'],
                          kind='strict' if data['inferenceKind'] == 'deductive' else 'defeasible',
                          scheme=data['scheme'], source=dict(path=path, sha256=fingerprint)))
    theory = dict(schemaVersion=1, id='model-v0-1-pilot', profile=PROFILE['id'],
                signature=config['signature'], statements=bound,
                ordinaryPremises=list(config['ordinaryPremises']), rules=rules, undercutters=[])
    admit_opposition(theory)
    binding_sources = [dict(path=path, sha256=hashlib.sha256((ROOT / path).read_bytes()).hexdigest())
                       for path in ['reasoning/model-bindings.json', 'reasoning/opposition-bindings.json']]
    for record in [*theory['statements'], *theory['rules']]:
        record['source']['bindings'] = binding_sources
    validate(theory)
    return theory


def admit_opposition(theory):
    """All recorded applications participate; starting assumptions require admission.

    Signed references denote exact classical negation, not a weaker alternative
    explanation. Corpus role and empirical support never create a premise.
    """
    config = json.loads((ROOT / 'reasoning/opposition-bindings.json').read_text())
    exact_keys(config, ['schemaVersion', 'signature', 'statements', 'applications',
                        'ordinaryPremises', 'undercutters'])
    if type(config['schemaVersion']) is not int or config['schemaVersion'] != 1:
        raise InvalidTheory('Unknown opposition-binding schema')
    if not isinstance(config['signature'], str):
        raise InvalidTheory('Opposition signature must be a string')
    statements = markdown_records('src/content/model/alternatives')
    arguments = markdown_records('src/content/model/alternative-arguments')
    for key, records in [('statements', statements), ('applications', arguments)]:
        if not isinstance(config[key], dict) or set(config[key]) != set(records):
            raise InvalidTheory(f'Alternative {key} inventory changed; review formal bindings explicitly')
    if set(statements) & {s['id'] for s in theory['statements']}:
        raise InvalidTheory('Alternative statement IDs must be globally unique')
    if set(arguments) & {r['id'] for r in theory['rules']}:
        raise InvalidTheory('Alternative argument IDs must be globally unique')
    theory['signature'] += '\n' + config['signature'] if config['signature'] else ''
    for sid, binding in config['statements'].items():
        if not re.fullmatch(r'S-\d{3}', sid):
            raise InvalidTheory('Alternative statement requires a permanent S-ID')
        exact_keys(binding, ['text', 'formula', 'representation'])
        data, path, fingerprint = statements[sid]
        if binding['representation'] not in ('opaque-proposition', 'quantified-pilot'):
            raise InvalidTheory(f'{sid}: unknown formal representation')
        if binding['text'] != data['statement']:
            raise InvalidTheory(f'{sid}: alternative wording changed; review formal representation')
        theory['statements'].append(dict(id=sid, text=data['statement'], formula=binding['formula'],
                                         role='alternative', source=dict(path=path, sha256=fingerprint)))
    for rid, binding in config['applications'].items():
        if not re.fullmatch(r'ARG-\d{3}', rid):
            raise InvalidTheory('Alternative application requires a permanent ARG-ID')
        data, path, fingerprint = arguments[rid]
        if binding != {k: data[k] for k in ['premises', 'conclusion', 'inferenceKind', 'scheme']}:
            raise InvalidTheory(f'{rid}: alternative inference changed; review formal application')
        if data['inferenceKind'] not in ('deductive', 'defeasible'):
            raise InvalidTheory(f'{rid}: unknown inference kind')
        theory['rules'].append(dict(id=rid, premises=data['premises'], conclusion=data['conclusion'],
                                   kind='strict' if data['inferenceKind'] == 'deductive' else 'defeasible',
                                   scheme=data['scheme'], source=dict(path=path, sha256=fingerprint)))
    if not isinstance(config['ordinaryPremises'], list) or not isinstance(config['undercutters'], list):
        raise InvalidTheory('Opposition admissions and undercutters must be lists')
    for admission in config['ordinaryPremises']:
        exact_keys(admission, ['literal', 'rationale'])
        if not isinstance(admission['rationale'], str) or not admission['rationale'].strip():
            raise InvalidTheory('Premise admission requires a rationale')
        theory['ordinaryPremises'].append(admission['literal'])
    for attack in config['undercutters']:
        exact_keys(attack, ['statement', 'rule', 'rationale'])
        if not isinstance(attack['statement'], str) or not isinstance(attack['rule'], str):
            raise InvalidTheory('Undercut endpoints must be literal and rule identifiers')
        if not isinstance(attack['rationale'], str) or not attack['rationale'].strip():
            raise InvalidTheory('Undercut designation requires a rationale')
        theory['undercutters'].append({k: attack[k] for k in ['statement', 'rule']})


def pilot(argument_id):
    theory = load_model()
    rule = next(r for r in theory['rules'] if r['id'] == argument_id)
    # A separately named conditional scenario. The premise role is explicit and
    # does not silently amend the full working theory's starting assumptions.
    theory['id'] = 'pilot-' + argument_id
    theory['rules'] = [rule]
    theory['ordinaryPremises'] = list(rule['premises'])
    theory['undercutters'] = []
    return theory
