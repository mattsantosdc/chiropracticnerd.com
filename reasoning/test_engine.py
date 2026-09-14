import copy
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import z3
from py_arg.abstract_argumentation_classes.argument import Argument
from py_arg.abstract_argumentation_classes.defeat import Defeat
from py_arg.abstract_argumentation_classes.abstract_argumentation_framework import AbstractArgumentationFramework
from py_arg.algorithms.semantics.get_grounded_extension import get_grounded_extension
from py_arg.aspic_classes.argumentation_system import ArgumentationSystem
from py_arg.aspic_classes.argumentation_theory import ArgumentationTheory
from py_arg.aspic_classes.defeasible_rule import DefeasibleRule
from py_arg.aspic_classes.literal import Literal

from engine import (PROFILE, ROOT, InvalidTheory, IncompleteEvaluation, check_sat,
                    construct, evaluate, from_aif, impact, to_aif, validate)
from model import load_model, pilot, markdown_records


def theory(names=('p', 'q', 'r', 'u'), premises=('p',), rules=()):
    return dict(schemaVersion=1, id='synthetic-test', profile=PROFILE['id'],
                signature='\n'.join(f'(declare-fun {n} () Bool)' for n in names),
                statements=[dict(id=n, text=n, formula=n) for n in names],
                ordinaryPremises=list(premises), rules=list(rules), undercutters=[])


def rule(rid, premises, conclusion, kind='defeasible'):
    return dict(id=rid, premises=premises, conclusion=conclusion, kind=kind, scheme='synthetic test scheme')


def status(result, literal):
    return result['statements'][literal]['status']


class FoundationTests(unittest.TestCase):
    def test_review_impact_contains_actual_full_evaluation_changes(self):
        base = theory(premises=['p', 'u'], rules=[rule('d1', ['p'], 'q'), rule('d2', ['q'], 'r')])
        base['undercutters'] = [dict(statement='u', rule='d1')]
        cases = []
        # Withdrawal can reinstate support; a negative premise can rebut it.
        for premises in [['p'], ['p', 'u', '-q'], ['u'], ['p', 'q', 'u']]:
            changed = copy.deepcopy(base)
            changed['ordinaryPremises'] = premises
            cases.append((base, changed))
        no_attack = copy.deepcopy(base)
        no_attack['undercutters'] = []
        cases.append((base, no_attack))
        no_rule = copy.deepcopy(no_attack)
        no_rule['rules'] = no_rule['rules'][1:]
        cases.append((no_attack, no_rule))
        alternative = copy.deepcopy(base)
        alternative['rules'].append(rule('d3', ['p'], 'q'))
        cases.append((base, alternative))
        cycle = theory(names=['p', 'a', 'b', 'c'], premises=['p'], rules=[rule(f'd{x}', ['p'], x) for x in 'abc'])
        cycle['undercutters'] = [dict(statement='a', rule='db'), dict(statement='b', rule='dc'), dict(statement='c', rule='da')]
        broken = copy.deepcopy(cycle)
        broken['undercutters'].pop()
        cases.append((cycle, broken))
        completed = subprocess.run(['node', 'tests/helpers/review-impact-theory.mjs'],
                                   input=json.dumps(dict(cases=cases, canonical=load_model())), text=True, capture_output=True,
                                   cwd=ROOT, check=True, timeout=10)
        comparison = json.loads(completed.stdout)
        self.assertEqual(comparison['missingCanonicalEdges'], [])
        impacts = comparison['impacts']
        changed_count = 0
        for (before, after), affected in zip(cases, impacts, strict=True):
            old_result, new_result = evaluate(before), evaluate(after)
            changed = {sid for sid in old_result['statements']
                       if status(old_result, sid) != status(new_result, sid)}
            changed_count += len(changed)
            self.assertTrue(changed <= set(affected), (changed, affected))
        self.assertGreater(changed_count, 0)

    def test_f01_joint_premises_are_not_alternative_support(self):
        t = theory(rules=[rule('d1', ['p', 'q'], 'r')])
        self.assertEqual(status(evaluate(t), 'r'), 'no-argument')
        t['ordinaryPremises'].append('q')
        self.assertEqual(status(evaluate(t), 'r'), 'accepted-support')

    def test_f02_alternative_route_survives(self):
        t = theory(premises=['p', 'q', 'u'], rules=[rule('d1', ['p'], 'r'), rule('d2', ['q'], 'r')])
        t['undercutters'] = [dict(statement='u', rule='d1')]
        result = evaluate(t)
        self.assertEqual(status(result, 'r'), 'accepted-support')
        self.assertEqual({a['status'] for a in result['arguments'] if a['conclusion'] == 'r'}, {'in', 'out'})

    def test_f03_unproductive_cycle_cannot_supply_a_starting_point(self):
        t = theory(premises=[], rules=[rule('d1', ['p'], 'q'), rule('d2', ['q'], 'p')])
        self.assertEqual(evaluate(t)['arguments'], [])

    def test_productive_cycle_is_explicitly_unsupported_not_silently_pruned(self):
        t = theory(rules=[rule('d1', ['p'], 'q'), rule('d2', ['q'], 'p')])
        with self.assertRaisesRegex(IncompleteEvaluation, 'cycle'):
            evaluate(t)

    def test_f04_symmetric_conflict_stays_undecided(self):
        result = evaluate(theory(premises=['p', '-p']))
        self.assertEqual(status(result, 'p'), 'unresolved-support')
        self.assertEqual(status(result, '-p'), 'unresolved-support')

    def test_f05_undercutting_an_inference_is_not_negating_its_conclusion(self):
        t = theory(premises=['p', 'u'], rules=[rule('d1', ['p'], 'q'), rule('d2', ['q'], 'r')])
        t['undercutters'] = [dict(statement='u', rule='d1')]
        result = evaluate(t)
        self.assertEqual(status(result, 'q'), 'rejected-support')
        self.assertEqual(status(result, 'r'), 'rejected-support')
        self.assertEqual(status(result, '-q'), 'no-argument')
        self.assertTrue(any('undercut' in a['kinds'] and a['defeat'] for a in result['attacks']))

    def test_f06_strict_label_does_not_establish_entailment(self):
        with self.assertRaisesRegex(InvalidTheory, 'not entailed'):
            evaluate(theory(rules=[rule('s1', ['p'], 'q', 'strict')]))

    def test_contradictory_premises_cannot_certify_a_strict_route(self):
        with self.assertRaisesRegex(InvalidTheory, 'inconsistent premises'):
            evaluate(theory(rules=[rule('s1', ['p', '-p'], 'q', 'strict')]))

    def test_f07_new_assumption_is_disclosed_and_changes_theory_identity(self):
        t = theory(rules=[rule('d1', ['p'], 'q')])
        before = evaluate(t)
        t['ordinaryPremises'].append('q')
        after = evaluate(t)
        self.assertNotEqual(before['theoryDigest'], after['theoryDigest'])
        self.assertFalse(before['statements']['q']['assumed'])
        self.assertTrue(after['statements']['q']['assumed'])
        self.assertEqual(len(after['statements']['q']['arguments']), 2)

    def test_f08_outside_challenge_is_included_and_order_does_not_select_a_winner(self):
        t = theory(rules=[rule('d1', ['p'], 'q')])
        self.assertEqual(status(evaluate(t), 'q'), 'accepted-support')
        t['ordinaryPremises'].append('-q')
        before = evaluate(t)
        self.assertEqual(status(before, 'q'), 'unresolved-support')
        t['statements'].reverse()
        self.assertEqual(evaluate(t)['statements'], before['statements'])

    def test_f09_reinstatement_hand_calculated_abstract_case(self):
        a, b, c = [Argument(n) for n in 'ABC']
        af = AbstractArgumentationFramework('reinstatement', [a, b, c], [Defeat(a, b), Defeat(b, c)])
        self.assertEqual(set(get_grounded_extension(af)), {a, c})
        b2, c2 = Argument('B'), Argument('C')
        af2 = AbstractArgumentationFramework('withdrawal', [b2, c2], [Defeat(b2, c2)])
        self.assertEqual(set(get_grounded_extension(af2)), {b2})

    def test_f10_missing_support_is_not_negation(self):
        result = evaluate(theory(premises=[]))
        self.assertEqual(status(result, 'p'), 'no-argument')
        self.assertEqual(status(result, '-p'), 'no-argument')

    def test_f11_definition_of_success_does_not_prove_occurrence(self):
        t = pilot('ARG-006')
        formulas = validate(t)
        premises = [formulas[s] for s in t['ordinaryPremises']]
        self.assertTrue(check_sat(premises + [z3.Not(formulas['S-011'])]))
        self.assertTrue(check_sat(premises + [z3.Not(formulas['S-027'])]))
        no_inputs = z3.parse_smt2_string(t['signature'] + '\n(assert (forall ((i Input)) (not (OccurredInput i))))')[0]
        self.assertTrue(check_sat(premises + [no_inputs]))
        self.assertEqual(status(evaluate(t), 'S-026'), 'accepted-support')

    def test_f12_real_quantified_deduction_needs_its_existential_premise(self):
        t = pilot('ARG-007')
        result = evaluate(t)
        self.assertEqual(result['strictProofs'], ['ARG-007'])
        self.assertEqual(status(result, 'S-027'), 'accepted-support')
        t['ordinaryPremises'].remove('S-011')
        self.assertEqual(status(evaluate(t), 'S-027'), 'no-argument')
        t['rules'][0]['premises'].remove('S-011')
        with self.assertRaisesRegex(InvalidTheory, 'not entailed'):
            evaluate(t)

    def test_quantifier_and_scope_strengthening_are_rejected(self):
        for expression in [
            '(forall ((i Input)) (=> (OccurredInput i) (exists ((e Event) (s FunctionalScope) (c Context) (t Interval)) (and (Causes i e) (Reorganization e) (Neuromotor s) (Benefit e s c t)))))',
            '(exists ((i Input) (e Event) (s FunctionalScope) (c Context) (t Interval)) (and (Causes i e) (Reorganization e) (not (Neuromotor s)) (Benefit e s c t)))',
        ]:
            t = pilot('ARG-007')
            next(s for s in t['statements'] if s['id'] == 'S-027')['formula'] = expression
            with self.assertRaisesRegex(InvalidTheory, 'not entailed'):
                evaluate(t)

    def test_disjoint_existential_claims_cannot_replace_joint_causation(self):
        t = pilot('ARG-007')
        next(s for s in t['statements'] if s['id'] == 'S-011')['formula'] = '(and (exists ((i Input) (e Event)) (and (OccurredInput i) (Causes i e) (Reorganization e))) (exists ((e Event) (s FunctionalScope) (c Context) (t Interval)) (and (Reorganization e) (Neuromotor s) (Improves e s c t))))'
        with self.assertRaisesRegex(InvalidTheory, 'not entailed'):
            evaluate(t)

    def test_f13_practical_strategy_does_not_authorize_an_individual_input(self):
        t = pilot('ARG-002')
        t['signature'] += '\n(declare-fun indicated () Bool)'
        t['statements'].append(dict(id='IndividualIndication', text='An input is indicated for this individual.', formula='indicated'))
        result = evaluate(t)
        self.assertEqual(status(result, 'S-014'), 'accepted-support')
        self.assertEqual(status(result, 'IndividualIndication'), 'no-argument')
        t['rules'][0]['kind'] = 'strict'
        with self.assertRaisesRegex(InvalidTheory, 'not entailed'):
            evaluate(t)

    def test_f14_changed_canonical_definition_requires_formal_review(self):
        original = markdown_records
        def changed(directory):
            values = original(directory)
            if 'statements' in directory:
                values['S-024'][0]['statement'] = 'An adjustment is any delivered input.'
            return values
        with patch('model.markdown_records', changed):
            with self.assertRaisesRegex(InvalidTheory, 'S-024: wording changed'):
                load_model()

    def test_canonical_inventory_includes_nested_markdown_and_mdx(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'statements/nested').mkdir(parents=True)
            (root / 'statements/one.md').write_text('---\nid: S-001\n---\nBody')
            (root / 'statements/nested/two.mdx').write_text('---\nid: S-002\n---\nBody')
            with patch('model.ROOT', root):
                self.assertEqual(set(markdown_records('statements')), {'S-001', 'S-002'})

    def test_f15_authored_priorities_cannot_override_fixed_profile(self):
        t = theory(premises=['p', '-p'])
        t['priorities'] = {'p': 100}
        with self.assertRaises(InvalidTheory):
            evaluate(t)
        del t['priorities']
        t['profile'] = 'preferred-because-it-wins'
        with self.assertRaisesRegex(InvalidTheory, 'profile'):
            evaluate(t)
        for key, value in [('ordering', 'last-link-elitist'), ('semantics', 'preferred'), ('axioms', 'any')]:
            with patch.dict(PROFILE, {key: value}):
                with self.assertRaisesRegex(InvalidTheory, 'profile configuration'):
                    evaluate(theory())

    def test_f16_distinct_named_rules_preserve_distinct_undercut_targets(self):
        t = theory(premises=['p', 'u'], rules=[rule('d1', ['p'], 'q'), rule('d2', ['p'], 'q')])
        t['undercutters'] = [dict(statement='u', rule='d1')]
        result = evaluate(t)
        routes = {a['topRule']: a['status'] for a in result['arguments'] if a['conclusion'] == 'q'}
        self.assertEqual(routes, {'d1': 'out', 'd2': 'in'})
        self.assertEqual(status(result, 'q'), 'accepted-support')
        # Adding copies does not outvote an opposing ordinary premise.
        t['ordinaryPremises'].append('-q')
        self.assertEqual(status(evaluate(t), 'q'), 'unresolved-support')

    def test_upstream_pyarg_identity_issue_is_reproducible(self):
        p, q = Literal('p'), Literal('q')
        rules = [DefeasibleRule('d1', {p}, q), DefeasibleRule('d2', {p}, q)]
        raw = ArgumentationTheory(ArgumentationSystem({'p': p, 'q': q}, {'p': set(), 'q': set()}, [], rules), [], [p])
        self.assertEqual(len([a for a in raw.all_arguments if a.conclusion == q]), 1,
                         'If upstream fixes this, re-evaluate and remove the adapter workaround')

    def test_f17_resource_limit_and_solver_unknown_never_return_acceptance(self):
        t = theory(rules=[rule('d1', ['p'], 'q')])
        with patch.dict(PROFILE, maxArguments=1):
            with self.assertRaises(IncompleteEvaluation):
                evaluate(t)
        with patch('engine.z3.Solver') as factory:
            factory.return_value.check.return_value = z3.unknown
            factory.return_value.reason_unknown.return_value = 'injected timeout'
            with self.assertRaisesRegex(IncompleteEvaluation, 'unknown'):
                evaluate(pilot('ARG-007'))

    def test_f18_aif_round_trip_preserves_joint_rules_targets_and_configuration(self):
        t = theory(premises=['p', 'q', 'u'], rules=[rule('d1', ['p', 'q'], 'r')])
        t['undercutters'] = [dict(statement='u', rule='d1')]
        aif = json.loads(json.dumps(to_aif(t)))
        self.assertEqual(evaluate(from_aif(aif)), evaluate(t))
        edited = to_aif(t)
        edited['extensions']['cn:evaluationProfile']['semantics'] = 'preferred'
        self.assertEqual(PROFILE['semantics'], 'grounded')
        with self.assertRaises(InvalidTheory):
            from_aif(edited)
        aif['edges'].pop()
        with self.assertRaisesRegex(InvalidTheory, 'disagree'):
            from_aif(aif)

    def test_strict_transposition_and_subargument_closure_mixed_case(self):
        t = theory(names=['p', 'q', 'both', 'r'], premises=['both', '-r'],
                   rules=[rule('s1', ['both'], 'p', 'strict'), rule('d1', ['p'], 'r')])
        next(s for s in t['statements'] if s['id'] == 'both')['formula'] = '(and p q)'
        built, ordering, _, expanded = construct(t)
        self.assertTrue(any(r['premises'] == ['-p'] and r['conclusion'] == '-both' for r in expanded))
        result = evaluate(t)
        self.assertEqual(status(result, 'p'), 'accepted-support')
        self.assertEqual(status(result, 'r'), 'unresolved-support')
        self.assertEqual(status(result, '-r'), 'unresolved-support')
        self.assertEqual(len(result['checks']), 5)

    def test_impact_reaches_rule_objection_and_its_downstream_consequences(self):
        t = theory(rules=[rule('d1', ['p'], 'q'), rule('d2', ['q'], 'r')])
        t['undercutters'] = [dict(statement='u', rule='d1')]
        self.assertTrue({'u', 'd1', 'q', 'd2', 'r'} <= set(impact(t, ['u'])))

    def test_signature_cannot_hide_assumptions_and_formula_cannot_inject_commands(self):
        t = theory()
        t['signature'] += '\n(assert p)'
        with self.assertRaisesRegex(InvalidTheory, 'Signature'):
            evaluate(t)
        t = theory()
        t['statements'][0]['formula'] = 'p) (assert q'
        with self.assertRaises(InvalidTheory):
            evaluate(t)

    def test_invalid_references_duplicates_and_axioms_are_rejected(self):
        examples = []
        t = theory(); t['axioms'] = ['p']; examples.append(t)
        t = theory(); t['ordinaryPremises'].append('p'); examples.append(t)
        t = theory(rules=[rule('d1', ['missing'], 'q')]); examples.append(t)
        t = theory(rules=[rule('d1', ['p', 'p'], 'q')]); examples.append(t)
        t = theory(); t['statements'][0]['status'] = 'accepted'; examples.append(t)
        for t in examples:
            with self.assertRaises(InvalidTheory):
                evaluate(t)

    def test_complete_current_model_has_explicit_premises_and_two_checked_deductions(self):
        t = load_model()
        result = evaluate(t)
        self.assertEqual(len(t['statements']), 31)
        self.assertEqual(len(t['rules']), 8)
        self.assertEqual(result['strictProofs'], ['ARG-006', 'ARG-007'])
        conclusions = {r['conclusion'] for r in t['rules']}
        self.assertFalse(conclusions & set(t['ordinaryPremises']))

    def test_professional_aim_requires_benefit_and_normative_bridge_without_potential_or_mechanism(self):
        t = load_model()
        self.assertNotIn('S-005', t['ordinaryPremises'])
        for removed in ['S-011', 'S-022', 'S-029']:
            changed = copy.deepcopy(t)
            changed['ordinaryPremises'].remove(removed)
            result = evaluate(changed)
            for downstream in ['S-005', 'S-006', 'S-014', 'S-016']:
                self.assertEqual(status(result, downstream), 'no-argument', (removed, downstream))
        independent = copy.deepcopy(t)
        independent['rules'] = [r for r in independent['rules'] if r['id'] != 'ARG-005']
        independent['ordinaryPremises'].remove('S-028')
        result = evaluate(independent)
        self.assertEqual(status(result, 'S-004'), 'no-argument')
        self.assertEqual(status(result, 'S-028'), 'no-argument')
        self.assertEqual(status(result, 'S-005'), 'accepted-support')
        self.assertFalse(result['statements']['S-005']['assumed'])

    def test_professional_purpose_undercut_propagates_without_negating_functional_benefit(self):
        t = load_model()
        t['signature'] += '\n(declare-fun PurposeObjection () Bool)'
        t['statements'].append(dict(id='PurposeObjection', formula='PurposeObjection',
                                    text='A hypothetical objection defeats this use of the professional-purpose bridge.',
                                    role='hypothetical'))
        t['ordinaryPremises'].append('PurposeObjection')
        t['undercutters'] = [dict(statement='PurposeObjection', rule='ARG-008')]
        result = evaluate(t)
        for downstream in ['S-005', 'S-006', 'S-014', 'S-016']:
            self.assertEqual(status(result, downstream), 'rejected-support')
        self.assertEqual(status(result, 'S-027'), 'accepted-support')
        self.assertEqual(status(result, '-S-005'), 'no-argument')

    def test_professional_purpose_reason_is_not_a_strict_entailment(self):
        t = pilot('ARG-008')
        self.assertEqual(status(evaluate(t), 'S-005'), 'accepted-support')
        t['rules'][0]['kind'] = 'strict'
        with self.assertRaisesRegex(InvalidTheory, 'not entailed'):
            evaluate(t)

    def test_network_capacity_does_not_invent_likelihood_or_beneficial_transfer(self):
        t = load_model()
        self.assertTrue({'S-012', 'S-030', 'S-031'} <= set(t['ordinaryPremises']))
        for removed in ['S-012', 'S-031']:
            changed = copy.deepcopy(t)
            changed['ordinaryPremises'].remove(removed)
            result = evaluate(changed)
            self.assertEqual(status(result, removed), 'no-argument')
            self.assertEqual(status(result, 'S-011'), 'accepted-support')
            self.assertEqual(status(result, 'S-030'), 'accepted-support')
        independent = copy.deepcopy(t)
        independent['ordinaryPremises'] = [sid for sid in t['ordinaryPremises']
                                          if sid not in ['S-012', 'S-030', 'S-031']]
        result = evaluate(independent)
        for sid in ['S-012', 'S-030', 'S-031']:
            self.assertEqual(status(result, sid), 'no-argument')
        for sid in ['S-027', 'S-005']:
            self.assertEqual(status(result, sid), 'accepted-support')
            self.assertFalse(result['statements'][sid]['assumed'])

    def test_migration_map_preserves_every_legacy_relationship_and_limiting_note(self):
        record = json.loads((ROOT / 'reasoning/dependency-migration.json').read_text())
        self.assertEqual(record['schemaVersion'], 2)
        self.assertEqual(len(record['relationships']), 38)
        actual = {}
        for sid, (data, _, _) in markdown_records('src/content/model/statements').items():
            for dependency in data['upstream']:
                actual[(dependency['id'], sid)] = (dependency['role'], dependency['note'])
        identities = {(r['source'], r['target']) for r in record['relationships']}
        self.assertEqual(len(identities), len(record['relationships']))
        retired = {('S-004', 'S-005'): 'retired-context-only',
                   ('S-022', 'S-005'): 'replaced-by-argument-path'}
        self.assertEqual({(r['source'], r['target']): r['disposition'] for r in record['relationships']
                          if r['disposition'] in retired.values()}, retired)
        mapped = {(r['source'], r['target']): (r['legacyRole'], r['legacyNote'])
                  for r in record['relationships'] if (r['source'], r['target']) not in retired}
        self.assertEqual(len(actual), 40)
        self.assertEqual(mapped, {pair: value for pair, value in actual.items() if pair in identities})
        # These uses were authored after the original migration snapshot. Keep
        # the original 38 identities and notes intact instead of falsifying their origin.
        self.assertEqual(set(actual) - identities, {('S-008', 'S-030'), ('S-030', 'S-031'),
                                                   ('S-024', 'S-031'), ('S-030', 'S-012')})
        self.assertEqual(next(r['disposition'] for r in record['relationships']
                              if (r['source'], r['target']) == ('S-011', 'S-012')),
                         'retain-explicit-semantic-use')
        self.assertEqual(sum(r['disposition'] == 'requires-semantic-decision'
                             for r in record['relationships']), 6)
        rules = {r['id']: r for r in load_model()['rules']}
        for item in record['relationships']:
            for rid in item['applications']:
                self.assertIn(item['source'], rules[rid]['premises'])
                self.assertEqual(item['target'], rules[rid]['conclusion'])
            if item['disposition'] == 'replaced-by-argument-path':
                self.assertEqual(item['argumentPath'], ['ARG-007', 'ARG-008'])
                current = item['source']
                for rid in item['argumentPath']:
                    self.assertIn(current, rules[rid]['premises'])
                    current = rules[rid]['conclusion']
                self.assertEqual(current, item['target'])
            else:
                self.assertNotIn('argumentPath', item)


if __name__ == '__main__':
    unittest.main()
