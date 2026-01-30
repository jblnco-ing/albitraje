---
name: git-commit-helper
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
---

# Git Commit Helper

## Quick start

Analyze staged changes and generate commit message using the helper script (which automatically logs usage):

```bash
# Run the analyzer script
bash .agent/skills/git-commit-helper/scripts/analyze_diff.sh

# Generate commit message based on the output
# (Gemini will analyze the diff output provided by the script)
```

## Commit message format

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

**Feature commit:**

```
feat(auth): add JWT authentication

Implement JWT-based authentication system with:
- Login endpoint with token generation
- Token validation middleware
- Refresh token support
```

**Bug fix:**

```
fix(api): handle null values in user profile

Prevent crashes when user profile fields are null.
Add null checks before accessing nested properties.
```

## Analyzing changes

Review what's being committed using the integrated tool:

```bash
# Show files changed
git status

# Show detailed changes AND log the activity (Recommended)
bash .agent/skills/git-commit-helper/scripts/analyze_diff.sh

# Show statistics
git diff --staged --stat
```

## Commit message guidelines

**DO:**

- Use imperative mood ("add feature" not "added feature")
- Keep first line under 50 characters
- Capitalize first letter
- No period at end of summary
- Explain WHY not just WHAT in body

**DON'T:**

- Use vague messages like "update" or "fix stuff"
- Include technical implementation details in summary
- Write paragraphs in summary line
- Use past tense

## Template workflow

1. **Review changes**: `git diff --staged`
2. **Identify type**: Is it feat, fix, refactor, etc.?
3. **Determine scope**: What part of the codebase?
4. **Write summary**: Brief, imperative description
5. **Add body**: Explain why and what impact
6. **Note breaking changes**: If applicable

## Best practices

1. **Atomic commits** - One logical change per commit
2. **Test before commit** - Ensure code works
3. **Reference issues** - Include issue numbers if applicable
4. **Keep it focused** - Don't mix unrelated changes
5. **Write for humans** - Future you will read this
