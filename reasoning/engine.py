"""Explicit, bounded ASPIC+ adapter. PyArg owns attacks, defeats and grounded semantics.

The local construction adapter preserves rule identities and rejects productive
inference cycles instead of silently pruning them. See docs/aspic-foundation.md.
"""
from __future__ import annotations

import hashlib
import copy
import importlib.metadata
import itertools
import json
import re
from pathlib import Path

import z3
from py_arg.algorithms.semantics.get_grounded_extension import get_grounded_extension
from py_arg.aspic_classes.argumentation_system import ArgumentationSystem
from py_arg.aspic_classes.argumentation_theory import ArgumentationTheory
from py_arg.aspic_classes.defeasible_rule import DefeasibleRule
from py_arg.aspic_classes.instantiated_argument import InstantiatedArgument
from py_arg.aspic_classes.literal import Literal
from py_arg.aspic_classes.orderings.argument_orderings.weakest_link_ordering import WeakestLinkElitistOrdering
from py_arg.aspic_classes.orderings.preference_preorder import PreferencePreorder
from py_arg.aspic_classes.strict_rule import StrictRule

ROOT = Path(__file__).resolve().parents[1]
PROFILE = json.loads((ROOT / 'reasoning/profile.json').read_text())
SYMBOL = re.compile(r'[A-Za-z][A-Za-z0-9_-]*\Z')
SUPPORTED_PROFILE = {
    'id': 'cn-aspic-grounded-1', 'schemaVersion': 1,
    'reference': 'Modgil and Prakken 2013, with 2018 corrigendum',
    'semantics': 'grounded', 'ordering': 'weakest-link-elitist',
    'ordinaryPremisePriorities': 'equal', 'defeasibleRulePriorities': 'equal',
    'axioms': 'none', 'negation': 'explicit-classical',
    'rebut': 'restricted-to-defeasible-subconclusions', 'strictClosure': 'transposition',
    'strictProof': 'SMT-LIB-2-Z3-entailment-with-satisfiable-premises',
    'productiveInferenceCycles': 'reject-as-unsupported',
    'engine': 'python-argumentation==2.0.2', 'adapter': 'cn-rule-identity-1',
    'solver': 'z3-solver==4.15.4.0',
}


class InvalidTheory(ValueError):
    """Input does not meet the declared profile. No evaluation is returned."""


class IncompleteEvaluation(RuntimeError):
    """Unsupported construction or resource limit. Never an acceptance result."""


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'),
                                     ensure_ascii=False).encode()).hexdigest()


def negative(literal):
    return literal[1:] if literal.startswith('-') else '-' + literal


def exact_keys(value, required, optional=()):
    if not isinstance(value, dict) or not set(required) <= value.keys() or value.keys() - set(required) - set(optional):
        raise InvalidTheory(f'Expected fields {sorted(required)} with optional {sorted(optional)}')


def unique(values, description):
    if not isinstance(values, list) or any(not isinstance(x, str) for x in values) or len(set(values)) != len(values):
        raise InvalidTheory(f'{description} must be a list of unique strings')


def sexpressions(text):
    """Read the deliberately small SMT-LIB signature subset, never execute commands."""
    if not isinstance(text, str) or len(text) > 200_000:
        raise InvalidTheory('SMT text must be a bounded string')
    # No quoted identifiers, comments, strings or commands hidden inside them.
    if re.search(r'[^A-Za-z0-9_\-\s()=><+*/.!?]', text):
        raise InvalidTheory('Unsupported SMT-LIB token')
    tokens = re.findall(r'\(|\)|[^\s()]+', text)
    stack, result = [], []
    for token in tokens:
        if token == '(':
            if len(stack) >= 100:
                raise InvalidTheory('SMT nesting limit exceeded')
            stack.append([])
        elif token == ')':
            if not stack:
                raise InvalidTheory('Unbalanced SMT-LIB expression')
            item = stack.pop()
            (stack[-1] if stack else result).append(item)
        else:
            if not stack:
                raise InvalidTheory('Expected a parenthesized SMT-LIB expression')
            stack[-1].append(token)
    if stack:
        raise InvalidTheory('Unbalanced SMT-LIB expression')
    return result


def parse_formulas(theory):
    signature = theory['signature']
    for command in sexpressions(signature):
        if not command or command[0] not in ('declare-sort', 'declare-fun'):
            raise InvalidTheory('Signature permits only sort and function declarations, never assertions or definitions')
        if command[0] == 'declare-sort' and (len(command) != 3 or command[2] != '0'):
            raise InvalidTheory('Only uninterpreted sorts of arity zero are supported')
        if command[0] == 'declare-fun' and (len(command) != 4 or command[3] != 'Bool'):
            raise InvalidTheory('Only predicates and Boolean constants are supported')
    formulas = {}
    for statement in theory['statements']:
        formula = statement['formula']
        # Wrapping and inspecting the S-expression prevents injecting another assertion.
        expression = sexpressions('(assert ' + formula + ')')
        if len(expression) != 1 or len(expression[0]) != 2:
            raise InvalidTheory('Expected one closed Boolean formula')
        try:
            parsed = z3.parse_smt2_string(signature + '\n(assert ' + formula + ')')
        except z3.Z3Exception as error:
            raise InvalidTheory(f"Invalid formula for {statement['id']}: {error}") from error
        if len(parsed) != 1:
            raise InvalidTheory('Expected exactly one formula')
        formulas[statement['id']] = parsed[0]
        formulas[negative(statement['id'])] = z3.Not(parsed[0])
    return formulas


def check_sat(formulas, timeout_ms=None):
    solver = z3.Solver()
    solver.set(timeout=PROFILE['solverTimeoutMs'] if timeout_ms is None else timeout_ms)
    solver.add(*formulas)
    result = solver.check()
    if result == z3.unknown:
        raise IncompleteEvaluation(f'Proof solver returned unknown: {solver.reason_unknown()}')
    return result == z3.sat


def check_strict(rule, formulas):
    premises = [formulas[p] for p in rule['premises']]
    if not check_sat(premises):
        raise InvalidTheory(f"{rule['id']}: inconsistent premises cannot certify a strict route")
    if check_sat([*premises, z3.Not(formulas[rule['conclusion']])]):
        raise InvalidTheory(f"{rule['id']}: conclusion is not entailed by the formal premises")


def validate(theory):
    # Policy files must describe implemented behavior. Never relabel a computation
    # by accepting a setting that the adapter would ignore.
    exact_keys(PROFILE, [*SUPPORTED_PROFILE, 'maxArguments', 'solverTimeoutMs'])
    if any(PROFILE[key] != value for key, value in SUPPORTED_PROFILE.items()):
        raise InvalidTheory('Unsupported profile configuration; update the implementation and conformance tests explicitly')
    for key, maximum in [('maxArguments', 5000), ('solverTimeoutMs', 5000)]:
        if type(PROFILE[key]) is not int or not 1 <= PROFILE[key] <= maximum:
            raise InvalidTheory(f'Unsupported resource limit: {key}')
    exact_keys(theory, ['schemaVersion', 'id', 'profile', 'signature', 'statements',
                       'ordinaryPremises', 'rules', 'undercutters'])
    if theory['schemaVersion'] != 1 or theory['profile'] != PROFILE['id']:
        raise InvalidTheory('Unknown theory schema or evaluation profile')
    if not isinstance(theory['id'], str) or not SYMBOL.fullmatch(theory['id']):
        raise InvalidTheory('Invalid theory identity')
    if not isinstance(theory['statements'], list) or not isinstance(theory['rules'], list):
        raise InvalidTheory('Statements and rules must be lists')
    if len(theory['statements']) > 120 or len(theory['rules']) > 120:
        raise IncompleteEvaluation('Pilot input size limit exceeded')
    ids = set()
    for statement in theory['statements']:
        exact_keys(statement, ['id', 'text', 'formula'], ['source', 'role'])
        sid = statement['id']
        if not isinstance(sid, str) or not SYMBOL.fullmatch(sid) or sid in ids:
            raise InvalidTheory('Statement identities must be unique positive symbols')
        if not isinstance(statement['text'], str) or not statement['text'].strip():
            raise InvalidTheory('Each proposition requires exact readable text')
        if statement.get('role', 'working-claim') not in ('working-claim', 'alternative', 'hypothetical'):
            raise InvalidTheory('Unknown corpus role')
        ids.add(sid)
    literals = ids | {negative(s) for s in ids}
    unique(theory['ordinaryPremises'], 'Ordinary premises')
    if not set(theory['ordinaryPremises']) <= literals:
        raise InvalidTheory('Unknown ordinary premise')
    rule_ids = set()
    for rule in theory['rules']:
        exact_keys(rule, ['id', 'premises', 'conclusion', 'kind', 'scheme'], ['source'])
        rid = rule['id']
        if not isinstance(rid, str) or not SYMBOL.fullmatch(rid) or rid in rule_ids or rid in ids:
            raise InvalidTheory('Rule identities must be unique and separate from statement identities')
        if rule['kind'] not in ('strict', 'defeasible'):
            raise InvalidTheory('Unknown inference kind')
        if not isinstance(rule['scheme'], str) or not rule['scheme'].strip():
            raise InvalidTheory('Every rule requires a named scheme')
        unique(rule['premises'], f'{rid} premises')
        if not rule['premises'] or not set(rule['premises']) <= literals or rule['conclusion'] not in literals:
            raise InvalidTheory(f'{rid} has missing premises or conclusion')
        if rule['conclusion'] in rule['premises']:
            raise InvalidTheory(f'{rid} directly assumes its conclusion')
        rule_ids.add(rid)
    if not isinstance(theory['undercutters'], list):
        raise InvalidTheory('Undercutters must be a list')
    pairs = set()
    for attack in theory['undercutters']:
        exact_keys(attack, ['statement', 'rule'])
        pair = (attack['statement'], attack['rule'])
        if pair in pairs or attack['statement'] not in literals or attack['rule'] not in rule_ids:
            raise InvalidTheory('Invalid or duplicate undercut target')
        if next(r for r in theory['rules'] if r['id'] == attack['rule'])['kind'] != 'defeasible':
            raise InvalidTheory('Undercutting a strict rule is not supported by this profile')
        pairs.add(pair)
    formulas = parse_formulas(theory)
    for rule in theory['rules']:
        if rule['kind'] == 'strict':
            check_strict(rule, formulas)
    return formulas


def transposed_rules(rules):
    """Generate precisely the transpositions of strict rules; no defeasible contraposition."""
    result = list(rules)
    signatures = {(r['kind'], tuple(sorted(r['premises'])), r['conclusion']) for r in rules}
    for rule in rules:
        if rule['kind'] != 'strict':
            continue
        for premise in rule['premises']:
            antecedents = sorted({negative(rule['conclusion']), *(p for p in rule['premises'] if p != premise)})
            conclusion = negative(premise)
            key = ('strict', tuple(antecedents), conclusion)
            if key in signatures:
                continue
            signatures.add(key)
            result.append(dict(id='T:' + digest(key), premises=antecedents,
                               conclusion=conclusion, kind='strict', scheme='strict transposition'))
    return result


class NamedRule:
    """PyArg 2.0.2 otherwise equates rules by endpoints, losing undercut targets."""
    def _identity(self):
        return (type(self).__name__, self.id, tuple(map(str, self.antecedents)), str(self.consequent))

    def __hash__(self):
        return hash(self._identity())

    def __eq__(self, other):
        return isinstance(other, NamedRule) and self._identity() == other._identity()

    def __lt__(self, other):
        return self._identity() < other._identity()


class NamedStrictRule(NamedRule, StrictRule):
    pass


class NamedDefeasibleRule(NamedRule, DefeasibleRule):
    pass


class CompleteAcyclicTheory(ArgumentationTheory):
    """Exhaustive construction for the supported acyclic productive inference graph.

    Attacks can cycle. Unproductive rule cycles build no arguments. A productive
    inference cycle is an explicit unsupported-input error, never silently pruned.
    """
    def _recompute_arguments(self):
        system = self.argumentation_system
        rules = [*system.strict_rules, *system.defeasible_rules]
        reachable = set(self.knowledge_base_ordinary_premises)
        while True:
            expanded = reachable | {r.consequent for r in rules if set(r.antecedents) <= reachable}
            if expanded == reachable:
                break
            reachable = expanded
        productive = [r for r in rules if set(r.antecedents) <= reachable]
        by_conclusion = {literal: [] for literal in system.language.values()}
        for rule in productive:
            by_conclusion[rule.consequent].append(rule)
        arguments, visiting, count = {}, set(), 0

        def build(literal):
            nonlocal count
            if literal in visiting:
                raise IncompleteEvaluation(f'Productive inference cycle at {literal}; no pruning was applied')
            if literal in arguments:
                return arguments[literal]
            visiting.add(literal)
            result = set()
            if literal in self.knowledge_base_ordinary_premises:
                result.add(InstantiatedArgument.ordinary_premise_based(literal))
            for rule in sorted(by_conclusion[literal], key=lambda r: r.id):
                choices = [build(antecedent) for antecedent in rule.antecedents]
                for children in itertools.product(*choices):
                    if count + len(result) >= PROFILE['maxArguments']:
                        raise IncompleteEvaluation('Argument limit exceeded; no partial status is returned')
                    factory = InstantiatedArgument.strict_rule_based if isinstance(rule, StrictRule) else InstantiatedArgument.defeasible_rule_based
                    argument = factory(rule, set(children))
                    # Set identity BEFORE inserting into any hash-based collection.
                    argument.name = 'A-' + digest([rule.id, str(literal), sorted(c.name for c in children)])
                    result.add(argument)
            count += len(result)
            if count > PROFILE['maxArguments']:
                raise IncompleteEvaluation('Argument limit exceeded')
            visiting.remove(literal)
            arguments[literal] = result
            return result

        for literal in sorted(system.language.values(), key=str):
            build(literal)
        self._arguments = arguments


def construct(theory):
    formulas = validate(theory)
    rules = transposed_rules(theory['rules'])
    language = {name: Literal(name) for name in formulas}
    strict, defeasible = [], []
    for rule in rules:
        kind = NamedStrictRule if rule['kind'] == 'strict' else NamedDefeasibleRule
        item = kind(rule['id'], {language[p] for p in rule['premises']}, language[rule['conclusion']])
        (strict if rule['kind'] == 'strict' else defeasible).append(item)
    conflicts = {name: {language[negative(name)]} for name in language}
    # Equal base preorders are explicit, including reflexivity and both directions.
    rule_order = PreferencePreorder(list(itertools.product(defeasible, repeat=2)))
    system = ArgumentationSystem(language, conflicts, strict, defeasible, rule_order)
    for attack in theory['undercutters']:
        # Membership is directed: the conclusion is contrary to the named rule.
        system.language[attack['rule']].contraries_and_contradictories.add(language[attack['statement']])
    premises = [language[name] for name in theory['ordinaryPremises']]
    premise_order = PreferencePreorder(list(itertools.product(premises, repeat=2)))
    ordering = WeakestLinkElitistOrdering(rule_order, premise_order)
    argumentation = CompleteAcyclicTheory(system, [], premises, premise_order)
    return argumentation, ordering, formulas, rules


def evaluate(theory):
    for distribution, required in [('python-argumentation', '2.0.2'), ('z3-solver', '4.15.4.0')]:
        if importlib.metadata.version(distribution) != required:
            raise InvalidTheory(f'Runtime drift: require {distribution}=={required}')
    argumentation, ordering, formulas, rules = construct(theory)
    framework = argumentation.create_abstract_argumentation_framework(theory['id'], ordering=ordering)
    accepted = set(get_grounded_extension(framework))
    rejected = {b for a in accepted for b in a.get_outgoing_defeat_arguments}
    arguments = sorted(argumentation.all_arguments, key=lambda a: a.name)
    status = {a: 'in' if a in accepted else 'out' if a in rejected else 'undecided' for a in arguments}
    # Runtime checks supplement, rather than purport to prove, profile-wide results.
    if any(not a.sub_arguments <= accepted for a in accepted):
        raise InvalidTheory('Subargument closure violated')
    conclusions = {str(a.conclusion) for a in accepted}
    if any(negative(p) in conclusions for p in conclusions):
        raise InvalidTheory('Direct consistency violated')
    closure = set(conclusions)
    while True:
        expanded = closure | {r['conclusion'] for r in rules if r['kind'] == 'strict' and set(r['premises']) <= closure}
        if expanded == closure:
            break
        closure = expanded
    if closure != conclusions:
        raise InvalidTheory('Strict closure violated')
    if any(negative(p) in closure for p in closure):
        raise InvalidTheory('Indirect consistency violated')
    if not check_sat([formulas[p] for p in conclusions if p in formulas]):
        raise InvalidTheory('Accepted formulas are jointly inconsistent in the formal language')
    result_statements = {}
    for literal in sorted(formulas):
        routes = [a for a in arguments if str(a.conclusion) == literal]
        labels = {status[a] for a in routes}
        result_statements[literal] = {
            'status': 'accepted-support' if 'in' in labels else 'unresolved-support' if 'undecided' in labels else 'rejected-support' if routes else 'no-argument',
            'arguments': [a.name for a in routes],
            'assumed': literal in theory['ordinaryPremises'],
        }
    attacks = []
    for a, b in itertools.product(arguments, repeat=2):
        kinds = [name for name, predicate in [('undermine', argumentation.undermines),
                  ('rebut', argumentation.rebuts), ('undercut', argumentation.undercuts)] if predicate(a, b)]
        if kinds:
            attacks.append(dict(source=a.name, target=b.name, kinds=kinds,
                                defeat=argumentation.defeats(a, b, ordering)))
    return {
        'schemaVersion': 1, 'theory': theory['id'], 'theoryDigest': digest(theory),
        'profile': copy.deepcopy(PROFILE), 'profileDigest': digest(PROFILE),
        'adapterDigest': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'complete': True,
        'strictProofs': [r['id'] for r in theory['rules'] if r['kind'] == 'strict'],
        'statements': result_statements,
        'arguments': [dict(id=a.name, conclusion=str(a.conclusion), status=status[a],
                           premises=sorted(map(str, a.premises)),
                           topRule=a.top_rule.id if a.top_rule else None,
                           subarguments=sorted(s.name for s in a.sub_arguments if s != a)) for a in arguments],
        'attacks': attacks,
        'checks': ['subargument-closure', 'strict-closure', 'direct-consistency',
                   'indirect-consistency', 'formal-consistency'],
    }


def to_aif(theory):
    """AIF core graph plus a required, explicit executable-profile extension.

    This JSON application profile is not advertised as RDF/JSON-LD or a public
    dereferenceable export. Import rejects changes to either representation.
    """
    validate(theory)
    nodes, edges = [], []
    for statement in theory['statements']:
        for sid, text in [(statement['id'], statement['text']), (negative(statement['id']), 'Not: ' + statement['text'])]:
            nodes.append(dict(nodeID=sid, type='I', text=text))
    for rule in theory['rules']:
        nodes.append(dict(nodeID=rule['id'], type='RA', text=rule['scheme']))
        edges.extend(dict(fromID=p, toID=rule['id']) for p in rule['premises'])
        edges.append(dict(fromID=rule['id'], toID=rule['conclusion']))
    conflicts = [(s['id'], negative(s['id'])) for s in theory['statements']]
    conflicts += [(b, a) for a, b in conflicts]
    conflicts += [(a['statement'], a['rule']) for a in theory['undercutters']]
    for a, b in conflicts:
        cid = 'CA:' + digest([a, b])
        nodes.append(dict(nodeID=cid, type='CA', text='Conflict'))
        edges.extend([dict(fromID=a, toID=cid), dict(fromID=cid, toID=b)])
    for edge in edges:
        edge['edgeID'] = 'E:' + digest(edge)
    return dict(profile='cn-aif-aspic-1', nodes=nodes, edges=edges,
                extensions={'cn:aspicTheory': copy.deepcopy(theory), 'cn:evaluationProfile': copy.deepcopy(PROFILE)})


def from_aif(value):
    exact_keys(value, ['profile', 'nodes', 'edges', 'extensions'])
    exact_keys(value['extensions'], ['cn:aspicTheory', 'cn:evaluationProfile'])
    theory = value['extensions']['cn:aspicTheory']
    if value != to_aif(theory):
        raise InvalidTheory('AIF graph and executable profile disagree, or profile data was lost')
    return copy.deepcopy(theory)


def impact(theory, changed):
    """Conservative review index, not a replacement for full-theory reevaluation."""
    affected = set(changed)
    links = [(p, r['id']) for r in theory['rules'] for p in r['premises']]
    links += [(r['id'], r['conclusion']) for r in theory['rules']]
    links += [(a['statement'], a['rule']) for a in theory['undercutters']]
    for s in theory['statements']:
        links += [(s['id'], negative(s['id'])), (negative(s['id']), s['id'])]
    while True:
        expanded = affected | {b for a, b in links if a in affected}
        if expanded == affected:
            return sorted(affected)
        affected = expanded
