#!/usr/bin/env python3
"""Score a filled-in blind adjudication sheet against the gold set and the models.

The question this settles. Every model tops out near 55% on the domain gold set, and the whole
error sits in CLOSE, BROAD and NONE — the three classes whose labels are least verifiable. Two
explanations fit equally well:

  the task    the graded distinction is genuinely fuzzy and no model will do better.
  the labels  the gold set is noisy, the models are often right, and the ceiling is an artefact
              of scoring them against it.

Nothing in the benchmark can separate those, because both produce the same number. A human
judging the same cases blind can: agreement with gold supports the first, agreement with the
models against gold supports the second.

Reads the `## Antworten` block of the sheet. Answers are one relation per numbered line; blank
lines are skipped rather than counted as wrong.
"""
from __future__ import annotations

import argparse
import collections
import json
import re
import sys
from pathlib import Path

RELATIONS = {"EXACT", "CLOSE", "BROAD", "NARROW", "NONE"}


def read_answers(path: Path) -> dict:
    text = path.read_text()
    block = re.search(r"## Antworten.*?```(.*?)```", text, re.S)
    if not block:
        sys.exit("no ``` answer block under '## Antworten' found")
    out = {}
    for line in block.group(1).splitlines():
        m = re.match(r"\s*(\d+)\.\s*([A-Za-z]+)\s*$", line)
        if m and m.group(2).upper() in RELATIONS:
            out[int(m.group(1))] = m.group(2).upper()
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", default="docs/skos-alignment/bench/adjudication-2026-08-02.md")
    ap.add_argument("--key", required=True, help="the key JSON written alongside the sheet")
    args = ap.parse_args()

    answers = read_answers(Path(args.sheet))
    key = {e["n"]: e for e in json.loads(Path(args.key).read_text())}
    judged = sorted(set(answers) & set(key))
    if not judged:
        sys.exit("nothing filled in yet")

    models = sorted({m for e in key.values() for m in e["models"]})
    agree_gold = sum(1 for n in judged if answers[n] == key[n]["gold"])
    print(f"  {len(judged)} of {len(key)} cases judged\n")
    print(f"  human agrees with GOLD          {agree_gold}/{len(judged)}"
          f"  ({agree_gold / len(judged) * 100:.0f}%)")
    for m in models:
        agree = sum(1 for n in judged if answers[n] == key[n]["models"].get(m))
        # The decisive cell: gold says one thing, the model another, and the human sides with
        # the model. Every one of these is a point the model was docked for being right.
        rescued = sum(1 for n in judged
                      if key[n]["models"].get(m) != key[n]["gold"]
                      and answers[n] == key[n]["models"].get(m))
        print(f"  human agrees with {m[:22]:22s} {agree}/{len(judged)}"
              f"  ({agree / len(judged) * 100:.0f}%)   wrongly-marked-wrong: {rescued}")

    print("\n  by gold class:")
    per = collections.defaultdict(lambda: [0, 0])
    for n in judged:
        per[key[n]["gold"]][1] += 1
        if answers[n] == key[n]["gold"]:
            per[key[n]["gold"]][0] += 1
    for cls in ("EXACT", "CLOSE", "BROAD", "NARROW", "NONE"):
        hit, total = per[cls]
        if total:
            print(f"      {cls:6s} human matches gold {hit}/{total}")

    disagreements = [n for n in judged if answers[n] != key[n]["gold"]]
    if disagreements:
        print(f"\n  the {len(disagreements)} cases where you disagreed with the stored label:")
        for n in disagreements:
            e = key[n]
            votes = ", ".join(f"{m.split('/')[-1][:14]}={e['models'].get(m)}" for m in models)
            print(f"      {n:2d}. gold={e['gold']:6s} you={answers[n]:6s}   [{votes}]")
        print("\n  Each of these is either a gold-set correction to make, or a case where the"
              "\n  distinction is genuinely arguable. Both are worth knowing; only the first is"
              "\n  a defect.")


if __name__ == "__main__":
    main()
