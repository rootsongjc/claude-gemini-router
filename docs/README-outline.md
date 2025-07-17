# Documentation Structure Outline

This document outlines the target documentation structure for the Claude-Gemini Router project to help contributors understand the organization and maintain consistency.

## Root Level Documentation

### Primary Documentation Files

- **README.md** (English, default) - Main project documentation including overview, quick start, and basic usage
- **README.zh.md** (Chinese) - Chinese translation of the main README

### Specialized Documentation Files

- **ENVIRONMENT_VARIABLES.md** (English) - Comprehensive guide to all environment variables and configuration options
- **ENVIRONMENT_VARIABLES.zh.md** (Chinese) - Chinese translation of environment variables guide
- **TEST_GUIDE.md** (English) - Testing documentation including setup, running tests, and writing new tests
- **TEST_GUIDE.zh.md** (Chinese) - Chinese translation of testing guide

## Documentation Directory Structure

```
docs/
├── README-outline.md          # This file - structure documentation
├── index.md                   # Documentation index/landing page
└── [future subdirectories]    # For expanded documentation as needed
```

## Language Support

The project supports bilingual documentation:

- **English** - Primary language (default files without language suffix)
- **Chinese** - Secondary language (files with `.zh.md` suffix)

## File Naming Conventions

- English files: `FILENAME.md`
- Chinese files: `FILENAME.zh.md`
- Use UPPERCASE for root-level documentation files (following common conventions)
- Use lowercase for files within the `docs/` directory

## Content Guidelines

### README Files

- Project overview and purpose
- Quick start guide
- Basic usage examples
- Installation instructions
- Contributing guidelines
- License information

### Environment Variables Documentation

- Complete list of all environment variables
- Default values and acceptable ranges
- Usage examples
- Security considerations
- Configuration best practices

### Test Guide Documentation

- Testing framework setup
- How to run different test suites
- Writing new tests
- Test coverage expectations
- CI/CD integration details

### Future Expansion

The `docs/` directory is prepared for future expansion and may include:

- API documentation
- Architecture guides
- Deployment guides
- Performance optimization
- Troubleshooting guides
- Advanced configuration examples

## Maintenance Notes

- Keep language versions synchronized
- Update this outline when adding new documentation
- Ensure all documentation follows the established structure
- Consider using automated tools for translation consistency
- Review and update documentation with each major release
