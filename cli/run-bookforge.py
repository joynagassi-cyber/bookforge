# BookForge CLI Runner

Deterministic control loop for BookForge book production.

## Usage

```bash
python cli/run-bookforge.py <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize new BookForge project |
| `configure` | Interactive configuration wizard |
| `build` | Run book production pipeline |
| `verify` | Run validation checks |
| `status` | Show current project state |
| `route` | Route task to appropriate workflow |
| `pack` | Pack context for bounded task |
| `workflow` | Execute workflow step |
| `gate` | Check quality gate status |
| `paper-trail` | Show decision log |

## Commands Details

### `init`
```bash
python cli/run-bookforge.py init --name "My Book" --template book
```
Creates a new BookForge project with configuration.

### `configure`
```bash
python cli/run-bookforge.py configure
```
Interactive wizard to configure project settings.

### `build`
```bash
python cli/run-bookforge.py build --workflow draft-chapter --task "write chapter 3"
```
Runs the specified workflow with the given task.

### `verify`
```bash
python cli/run-bookforge.py verify --workflow chapter-qa
```
Runs validation checks for the specified workflow.

### `status`
```bash
python cli/run-bookforge.py status
```
Shows current phase, gate status, and pending tasks.

### `route`
```bash
python cli/run-bookforge.py route "fix typo in chapter 2"
```
Routes a task to the appropriate workflow.

### `gate`
```bash
python cli/run-bookforge.py gate --check upstream-ready
```
Checks a specific quality gate.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BOOKFORGE_PROJECT` | Project root directory | `.` |
| `BOOKFORGE_HOST` | Target host | `auto` |
| `BOOKFORGE_VERBOSE` | Enable verbose output | `false` |
| `BOOKFORGE_HEADLESS` | Non-interactive mode | `false` |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Validation failed |
| 3 | Gate blocked |
| 4 | Human approval required |
