"""Bind the pilot to exact canonical Markdown without adding any implicit premises."""
import hashlib
import json
from pathlib import Path

import yaml

from engine import ROOT, InvalidTheory, PROFILE, exact_keys


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
    return dict(schemaVersion=1, id='model-v0-1-pilot', profile=PROFILE['id'],
                signature=config['signature'], statements=bound,
                ordinaryPremises=config['ordinaryPremises'], rules=rules, undercutters=[])


def pilot(argument_id):
    theory = load_model()
    rule = next(r for r in theory['rules'] if r['id'] == argument_id)
    # A separately named conditional scenario. The premise role is explicit and
    # does not silently amend the full working theory's starting assumptions.
    theory['id'] = 'pilot-' + argument_id
    theory['rules'] = [rule]
    theory['ordinaryPremises'] = list(rule['premises'])
    return theory
