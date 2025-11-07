# GitHub Configuration

This directory contains GitHub-specific configurations for CI/CD, automation, and project management.

## Files

### workflows/ci.yml

Continuous Integration pipeline that runs on every push and pull request.

**Jobs:**

1. **Security Audit** - Scans dependencies for vulnerabilities using `npm audit`

   - Runs on all dependencies (moderate+ severity)
   - Fails on high-severity production vulnerabilities
   - Provides early warning for security issues

2. **Test** - Validates code quality and functionality

   - Unit tests via Vitest
   - E2E tests via Playwright
   - Ensures all changes are tested before merge

3. **Build** - Creates production bundle
   - Validates build succeeds
   - Tracks bundle size over time
   - Uploads artifacts for review

**Triggers:**

- Push to `main` or `001-todo-app` branches
- Pull requests to `main`

### dependabot.yml

Automated dependency updates configuration.

**Schedules:**

- npm dependencies: Weekly (Monday 9:00 AM)
- GitHub Actions: Weekly (Monday 9:00 AM)

**Features:**

- Automatic PR creation for dependency updates
- Smart versioning (ignores major bumps for stable deps)
- Auto-labeling for easy filtering
- Rate-limited to 10 open PRs max

**Protected Dependencies:**
Major version updates are ignored for:

- Preact (UI framework)
- Vite (build tool)
- Tailwind CSS (styling)

## Local Development

Run security audit locally:

```bash
npm run audit        # Check for vulnerabilities
npm run audit:fix    # Automatically fix issues
```

## CI/CD Best Practices

1. **Always review Dependabot PRs** - Don't auto-merge without testing
2. **Monitor npm audit output** - Address vulnerabilities promptly
3. **Check bundle size trends** - Watch for unexpected increases
4. **Keep workflows updated** - Dependabot handles GitHub Actions updates

## Security

- All workflows use pinned action versions (e.g., `@v4`)
- Dependabot keeps action versions current
- npm audit runs on every commit
- High-severity vulnerabilities block merges
