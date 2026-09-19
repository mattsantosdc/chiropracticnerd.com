"""Exercise the actual canonical authoring path in isolated repository copies.

All added propositions below are synthetic test stipulations, never clinical
claims or admissions into the repository's working theory.
"""
import copy
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from engine import ROOT, InvalidTheory, evaluate, from_aif, to_aif, impact
from model import load_model


class OppositionAuthoringTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        shutil.copytree(ROOT / 'src/content/model', self.root / 'src/content/model')
        (self.root / 'reasoning').mkdir()
        shutil.copy(ROOT / 'reasoning/model-bindings.json', self.root / 'reasoning/model-bindings.json')
        self.config = dict(schemaVersion=1, signature='', statements={}, applications={}, ordinaryPremises=[], undercutters=[])
        self.root_patch = patch('model.ROOT', self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)

    def statement(self, sid, text):
        data = dict(id=sid, slug='test-' + sid.lower(), title=text, statement=text,
                    summary=text, domain='framework', statementType='framework', confidence='not-applicable',
                    order=100, semanticUses=[], related=[], version='0.1', updated='2026-09-15')
        self.write('alternatives', sid, data)
        self.config['signature'] += f'\n(declare-fun {sid} () Bool)'
        self.config['statements'][sid] = dict(text=text, formula=sid, representation='opaque-proposition')

    def write(self, directory, identity, data):
        path = self.root / 'src/content/model' / directory / (identity + '.md')
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text('---\n' + json.dumps(data) + '\n---\nSynthetic test stipulation only.\n')

    def rule(self, rid, premises, conclusion, kind='defeasible'):
        binding = dict(premises=premises, conclusion=conclusion, inferenceKind=kind, scheme='synthetic test inference')
        data = dict(id=rid, slug='test-' + rid.lower(), title='Synthetic test inference',
                    summary='Conditional test only.', version='0.1', updated='2026-09-15', **binding)
        self.write('alternative-arguments', rid, data)
        self.config['applications'][rid] = binding

    def load(self):
        (self.root / 'reasoning/opposition-bindings.json').write_text(json.dumps(self.config))
        return load_model()

    def assume(self, literal):
        self.config['ordinaryPremises'].append(dict(literal=literal, rationale='Synthetic stipulation for this isolated test.'))

    def undercut(self, statement, rule):
        self.config['undercutters'].append(dict(statement=statement, rule=rule, rationale='Synthetic challenge to this exact inference.'))

    def test_recorded_alternative_and_rule_do_not_create_an_assumption(self):
        self.statement('S-033', 'The stipulated exception holds.')
        self.rule('ARG-011', ['S-033'], '-S-029')
        t = self.load()
        self.assertEqual(next(s for s in t['statements'] if s['id'] == 'S-033')['role'], 'alternative')
        self.assertNotIn('S-033', t['ordinaryPremises'])
        result = evaluate(t)
        self.assertEqual(result['statements']['-S-029']['status'], 'no-argument')
        self.assertEqual(result['statements']['S-005']['status'], 'accepted-support')

    def test_admitted_opposition_undermines_a_premise_in_the_full_model(self):
        self.statement('S-033', 'The stipulated exception holds.')
        self.rule('ARG-011', ['S-033'], '-S-029')
        self.assume('S-033')
        result = evaluate(self.load())
        self.assertEqual(result['statements']['S-029']['status'], 'unresolved-support')
        self.assertEqual(result['statements']['S-005']['status'], 'unresolved-support')
        self.assertEqual(result['statements']['S-027']['status'], 'accepted-support')

    def test_exact_negated_conclusion_rebuts_without_negating_its_premises(self):
        self.statement('S-033', 'The stipulated contrary conclusion follows.')
        self.rule('ARG-011', ['S-033'], '-S-005')
        self.assume('S-033')
        result = evaluate(self.load())
        self.assertEqual(result['statements']['S-005']['status'], 'unresolved-support')
        self.assertEqual(result['statements']['S-029']['status'], 'accepted-support')

    def test_derived_undercutter_and_defense_reinstate_the_target(self):
        self.statement('S-033', 'The purpose inference is inapplicable under the test stipulation.')
        self.statement('S-034', 'The stipulated exception holds.')
        self.statement('S-035', 'The exception inference is inapplicable under the test stipulation.')
        self.rule('ARG-011', ['S-034'], 'S-033')
        self.assume('S-034')
        self.undercut('S-033', 'ARG-008')
        attacked = self.load()
        self.assertEqual(evaluate(attacked)['statements']['S-005']['status'], 'rejected-support')
        self.assertEqual(evaluate(attacked)['statements']['-S-005']['status'], 'no-argument')
        self.assume('S-035')
        self.undercut('S-035', 'ARG-011')
        defended = self.load()
        self.assertEqual(evaluate(defended)['statements']['S-005']['status'], 'accepted-support')
        self.assertEqual(from_aif(to_aif(defended)), defended)
        self.assertIn('S-005', impact(defended, ['S-035']))

    def test_signed_premises_and_strict_proof_follow_existing_profile(self):
        self.statement('S-033', 'A synthetic proposition.')
        self.statement('S-034', 'Its exact negation in this test.')
        self.config['statements']['S-034']['formula'] = '(not S-033)'
        self.config['statements']['S-034']['representation'] = 'quantified-pilot'
        self.rule('ARG-011', ['-S-033'], 'S-034', 'deductive')
        self.assume('-S-033')
        self.assertEqual(evaluate(self.load())['statements']['S-034']['status'], 'accepted-support')
        self.config['statements']['S-034']['formula'] = 'S-034'
        with self.assertRaisesRegex(InvalidTheory, 'not entailed'):
            self.load()

    def test_admissions_reject_duplicates_unknown_literals_and_missing_rationales(self):
        for admission in [dict(literal='S-011', rationale='Duplicate'), dict(literal='S-999', rationale='Unknown'), dict(literal='-S-011', rationale=' '), dict(literal='-S-011', rationale='x', priority=10)]:
            with self.subTest(admission=admission):
                self.config['ordinaryPremises'] = [admission]
                with self.assertRaises(InvalidTheory): self.load()

    def test_undercuts_reject_strict_missing_and_duplicate_targets(self):
        for targets in [['ARG-007'], ['ARG-999'], ['ARG-008', 'ARG-008']]:
            with self.subTest(targets=targets):
                self.config['undercutters'] = []
                for rid in targets: self.undercut('S-029', rid)
                with self.assertRaises(InvalidTheory): self.load()

    def test_binding_drift_inventory_collision_and_signature_injection_fail(self):
        self.statement('S-033', 'A synthetic proposition.')
        original = copy.deepcopy(self.config)
        for mutate in [lambda c: c['statements']['S-033'].update(text='Changed wording'),
                       lambda c: c['statements'].clear(),
                       lambda c: c.update(signature='(assert false)'),
                       lambda c: c.update(priorities={}),
                       lambda c: c.update(schemaVersion=True)]:
            self.config = copy.deepcopy(original)
            mutate(self.config)
            with self.assertRaises(InvalidTheory): self.load()
        self.config = original
        self.statement('S-011', 'Collision with the adopted working account.')
        with self.assertRaisesRegex(InvalidTheory, 'globally unique'): self.load()


if __name__ == '__main__':
    unittest.main()
