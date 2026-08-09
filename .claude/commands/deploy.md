Execute a deploy sequence: stage all changes, craft a commit message that describes what changed (so a future rollback is self-explanatory), and push to the remote.

Steps:
1. Run `git status` to see what changed.
2. Run `git diff --staged` and `git diff` to read the full diff.
3. Stage all changes with `git add` (targeting specific files — never use -A blindly; inspect the status first and exclude anything that looks like secrets or binaries).
4. Write a commit message that:
   - Summarises the *what* in the subject line (≤ 72 chars, imperative mood, in English)
   - Adds a short body listing the main changes per file/area when there are multiple unrelated changes
   - Never includes "Co-Authored-By" or any author attribution
5. Commit using a heredoc so the message is formatted correctly.
6. Push to the current remote tracking branch (`git push`).

If `git push` is rejected (e.g. non-fast-forward), report the error and stop — do not force-push without explicit user confirmation.
