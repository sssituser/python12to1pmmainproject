"""
One-shot script: rewrites exam_views.py keeping lines 1..860 intact,
then appending the clean parse_raw_text_to_questions function.
"""
import re

SRC = r"c:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement\myapp\views\exam_views.py"

with open(SRC, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the broken function
MARKER = '\ndef parse_raw_text_to_questions(text):'
idx = content.find(MARKER)
if idx == -1:
    # try without leading newline
    MARKER = 'def parse_raw_text_to_questions(text):'
    idx = content.find(MARKER)

if idx == -1:
    print("ERROR: Could not find function marker!")
    exit(1)

# Keep everything before the function (up to the blank line before def)
before = content[:idx].rstrip()
print(f"Keeping {len(before)} chars before function.")

NEW_FUNCTION = '''

def parse_raw_text_to_questions(text):
    """
    Parse structured Q&A text from PDF/DOCX into question dicts.

    Supported Answer Formats:
    1. "Answer: B", "Ans: C", "Correct Answer: D", "Correct: A"
    2. Starred/Bracketed Options: "*A) text", "B)* text", "[C] text"
    3. End-of-document key tables: "1-B, 2-D, 3-A" or "1. B, 2. D"
    4. Compact no-space options: "A)2752 B)2746 C)2734 D)2718"
    """
    import logging
    logger = logging.getLogger(__name__)

    questions = []

    # ────────────────────────────────────────────────────────────────────────
    # STEP 1: Find global answer key table (end-of-doc style: 1-B, 2-C ...)
    # ────────────────────────────────────────────────────────────────────────
    global_answers = {}
    ans_key_re = re.compile(r\'(?<!\\d)(\\d{1,3})\\s*[-\\u2013\\u2014\\.:\\)]\\s*([A-Da-d])(?!\\w)\')
    all_pairs = list(ans_key_re.finditer(text))

    if len(all_pairs) >= 3:
        clusters = []
        cur = [all_pairs[0]]
        for j in range(1, len(all_pairs)):
            if all_pairs[j].start() - all_pairs[j-1].start() < 300:
                cur.append(all_pairs[j])
            else:
                clusters.append(cur)
                cur = [all_pairs[j]]
        clusters.append(cur)

        largest = max(clusters, key=len)
        if len(largest) >= 3:
            for pair in largest:
                global_answers[int(pair.group(1))] = ord(pair.group(2).upper()) - ord(\'A\')
            logger.info(f"Global answer key found: {global_answers}")

    # ────────────────────────────────────────────────────────────────────────
    # STEP 2: Split text into per-question blocks
    # ────────────────────────────────────────────────────────────────────────
    q_re = re.compile(
        r\'(?:^|\\n)\\s*(?:Q(?:uestion)?\\s*\\.?\\s*(\\d+)\\.?|(\\d+)\\s*[\\)\\.\\-:])\\s*\',
        re.IGNORECASE
    )
    matches = list(q_re.finditer(text))
    if not matches:
        logger.warning("No question markers found in document.")
        return questions

    logger.info(f"Found {len(matches)} question blocks")

    for i, m in enumerate(matches):
        q_num_str = m.group(1) or m.group(2)
        q_num = int(q_num_str) if (q_num_str and q_num_str.isdigit()) else (i + 1)

        block_start = m.end()
        block_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[block_start:block_end].strip()
        if not block:
            continue

        # ──────────────────────────────────────────────────────────────────
        # STEP 3: Extract inline answer indicator BEFORE parsing options
        # Matches: "Answer: B", "Ans.B", "Answer=D", "Correct: C", "Key: A"
        # ──────────────────────────────────────────────────────────────────
        inline_ans_re = re.compile(
            r\'(?i)\\b(?:ans(?:wer)?(?:\\s*key)?|correct(?:\\s*answer)?|key)\\s*[=:\\.\\-\\u2013\\u2014]?\\s*([A-Da-d])\\b\'
        )
        inline_m = inline_ans_re.search(block)
        found_letter = None
        clean_block = block

        if inline_m:
            found_letter = inline_m.group(1).upper()
            clean_block = (block[:inline_m.start()] + block[inline_m.end():]).strip()
            logger.debug(f"Q{q_num}: Inline answer \'{found_letter}\'")

        # ──────────────────────────────────────────────────────────────────
        # STEP 4: Parse options (handles both spaced and compact formats)
        # ──────────────────────────────────────────────────────────────────
        opt_marker_re = re.compile(r\'([A-Da-d])\\s*[\\)\\.\\:]\', re.MULTILINE)
        raw_markers = list(opt_marker_re.finditer(clean_block))

        valid_opts = []
        expected = [\'A\', \'B\', \'C\', \'D\']
        ei = 0
        for om in raw_markers:
            lbl = om.group(1).upper()
            if ei < len(expected) and lbl == expected[ei]:
                valid_opts.append(om)
                ei += 1
                if ei == 4:
                    break

        options = []
        question_body = clean_block

        if len(valid_opts) >= 2:
            question_body = clean_block[:valid_opts[0].start()].strip()
            for k, om in enumerate(valid_opts):
                s = om.end()
                e = valid_opts[k + 1].start() if k + 1 < len(valid_opts) else len(clean_block)
                opt_text = clean_block[s:e].strip()
                opt_text = re.sub(r\'\\s+\', \' \', opt_text).strip()
                opt_text = re.sub(
                    r\'(?i)\\s*\\b(?:ans(?:wer)?|correct|key)\\s*[=:\\.\\-\\u2013\\u2014]?\\s*[A-Da-d]\\b.*$\',
                    \'\', opt_text
                ).strip()
                options.append(opt_text)
        else:
            opt_line_re = re.compile(r\'^([A-Da-d])\\s*[\\)\\.\\:]\\s*(.+)$\')
            q_lines = []
            for line in clean_block.split(\'\\n\'):
                line = line.strip()
                if not line:
                    continue
                lm = opt_line_re.match(line)
                if lm:
                    options.append(lm.group(2).strip())
                else:
                    q_lines.append(line)
            question_body = \' \'.join(q_lines).strip()

        if not question_body:
            continue

        # ──────────────────────────────────────────────────────────────────
        # STEP 5: Determine correct answer index
        # ──────────────────────────────────────────────────────────────────
        correct_idx = None

        if found_letter is not None:
            correct_idx = ord(found_letter) - ord(\'A\')

        if correct_idx is None:
            star_re = re.compile(
                r\'(?i)[\\*\\[\\u2713\\u2714]\\s*([A-Da-d])\\s*[\\)\\]\\*]\'
                r\'|([A-Da-d])\\s*[\\)\\.]?\\s*[\\*\\[\\u2713\\u2714]\'
            )
            sm = star_re.search(block)
            if sm:
                lbl = (sm.group(1) or sm.group(2) or \'\').upper()
                if lbl in \'ABCD\':
                    correct_idx = ord(lbl) - ord(\'A\')
                    logger.debug(f"Q{q_num}: Star/bracket answer \'{lbl}\'")

        if correct_idx is None and q_num in global_answers:
            correct_idx = global_answers[q_num]
            logger.debug(f"Q{q_num}: Global key -> {chr(ord(\'A\') + correct_idx)}")

        if correct_idx is None:
            full_re = re.compile(
                r\'(?i)\\b(?:ans(?:wer)?|correct)\\s*[=:\\.\\-\\u2013\\u2014]?\\s*(.+)$\',
                re.MULTILINE
            )
            fm = full_re.search(block)
            if fm:
                ans_text = fm.group(1).strip().rstrip(\'.\')
                for k, opt in enumerate(options):
                    if opt and ans_text.lower() in opt.lower():
                        correct_idx = k
                        logger.debug(f"Q{q_num}: Answer text matched option {k}")
                        break

        if correct_idx is None:
            logger.warning(f"Q{q_num}: No answer detected, defaulting to A. Block: {block[:100]!r}")
            correct_idx = 0

        if options:
            correct_idx = max(0, min(correct_idx, len(options) - 1))

        # ──────────────────────────────────────────────────────────────────
        # STEP 6: Save question if valid
        # ──────────────────────────────────────────────────────────────────
        if len(options) >= 2:
            padded = (options + [\'\'] * 4)[:4]
            questions.append({
                \'question\': question_body,
                \'options\': padded,
                \'correct\': correct_idx,
                \'difficulty\': \'medium\',
                \'marks\': 1
            })
            logger.debug(f"Q{q_num}: Saved. Ans={chr(ord(\'A\') + correct_idx)}, opts={options}")
        else:
            logger.warning(f"Q{q_num}: Skipped — fewer than 2 options. Block: {block[:80]!r}")

    logger.info(f"Total questions parsed: {len(questions)}")
    return questions
'''

final = before + NEW_FUNCTION + '\n'
with open(SRC, 'w', encoding='utf-8') as f:
    f.write(final)

print(f"SUCCESS: Wrote {len(final)} chars to {SRC}")
# Verify
with open(SRC, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f"Total lines now: {len(lines)}")
