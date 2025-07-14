# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Removed
- Remove broken `/explore` command that referenced deleted `CommandDiscovery` engine
- Remove complex framework detection logic from setup.sh (60+ lines of unused code)
- Remove all references to deleted lib/ directory components
- Remove npm/package.json references from documentation

### Changed
- Simplify setup.sh to use basic project type detection only
- Update README.md to show correct command count (9 commands)
- Update README.md to link to Claude Code docs instead of npm installation
- Update CLAUDE.md project structure examples to avoid referencing deleted directories
- Update .claude/hooks/README.md to remove references to deleted lib/ infrastructure

### Fixed
- Fix hook configuration to use `python3` instead of `python` command
- Update settings.json to use `python3` for web search validation hooks
- Update setup.sh to use `python3` for Python project detection and hook creation
- Resolve "python: command not found" errors in hook execution

## Previous Changes
- Initial project setup with Claude Code template
- Implemented web search validation hooks
- Added quality checks and git hooks
- Created TDD workflow commands