/**
 * Config Generators Coverage Tests
 * 
 * RED phase tests for improving config generator coverage
 * Target: JavaScript (8.69% → 90%), Python (14.28% → 90%), Rust (18.18% → 90%)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import config generators we're testing
const JavaScriptConfigGenerator = require('../lib/config-generators/JavaScriptConfigGenerator');
const PythonConfigGenerator = require('../lib/config-generators/PythonConfigGenerator');
const RustConfigGenerator = require('../lib/config-generators/RustConfigGenerator');

describe('Config Generators Coverage', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-gen-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('JavaScriptConfigGenerator', () => {
    it('should generate React project configuration with TypeScript', () => {
      const detected = {
        languages: ['javascript', 'typescript'],
        frameworks: ['react'],
        testFrameworks: ['jest'],
        bundlers: ['webpack'],
        tools: ['npm'],
        primary: 'react'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config).toHaveProperty('claudeMdAdditions');
      expect(config.hooks).toContain('eslint --ext .js,.jsx,.ts,.tsx src/');
      expect(config.hooks).toContain('prettier --check src/');
      expect(config.hooks).toContain('tsc --noEmit');
      expect(config.commands.dev).toBe('npm run dev');
      expect(config.commands.test).toBe('npm test');
      expect(config.commands.build).toBe('npm run build');
    });

    it('should generate Next.js project configuration', () => {
      const detected = {
        languages: ['javascript', 'typescript'],
        frameworks: ['react', 'nextjs'],
        testFrameworks: ['jest'],
        bundlers: ['webpack'],
        tools: ['npm'],
        primary: 'nextjs'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('next lint');
      expect(config.commands.dev).toBe('npm run dev');
      expect(config.commands.build).toBe('npm run build');
      expect(config.claudeMdAdditions).toContain('Next.js');
    });

    it('should generate Node.js Express server configuration', () => {
      const detected = {
        languages: ['javascript'],
        frameworks: ['express'],
        testFrameworks: ['jest'],
        bundlers: [],
        tools: ['npm'],
        primary: 'express'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('eslint --ext .js,.jsx,.ts,.tsx src/');
      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.claudeMdAdditions).toContain('Express.js');
    });

    it('should handle Vue.js project configuration', () => {
      const detected = {
        languages: ['javascript', 'typescript'],
        frameworks: ['vue'],
        testFrameworks: ['vitest'],
        bundlers: ['vite'],
        tools: ['npm'],
        primary: 'vue'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('tsc --noEmit');
      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('build');
      expect(config.claudeMdAdditions).toContain('Vue.js');
    });

    it('should handle projects without TypeScript', () => {
      const detected = {
        languages: ['javascript'],
        frameworks: ['react'],
        testFrameworks: ['jest'],
        bundlers: ['webpack'],
        tools: ['npm'],
        primary: 'react'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).not.toContain('tsc --noEmit');
      expect(config.hooks).not.toContain('vue-tsc --noEmit');
      expect(config.hooks).toContain('eslint --ext .js,.jsx,.ts,.tsx src/');
    });

    it('should handle multiple test frameworks', () => {
      const detected = {
        languages: ['javascript', 'typescript'],
        frameworks: ['react'],
        testFrameworks: ['jest', 'cypress', 'playwright'],
        bundlers: ['webpack'],
        tools: ['npm'],
        primary: 'react'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('test');
      expect(config.commands).toHaveProperty('e2e');
      expect(config.commands.test).toBe('npm test');
    });

    it('should handle yarn package manager', () => {
      const detected = {
        languages: ['javascript'],
        frameworks: ['react'],
        testFrameworks: ['jest'],
        bundlers: ['webpack'],
        tools: ['yarn'],
        primary: 'react'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.commands).toHaveProperty('build');
    });

    it('should handle pnpm package manager', () => {
      const detected = {
        languages: ['javascript'],
        frameworks: ['react'],
        testFrameworks: ['jest'],
        bundlers: ['webpack'],
        tools: ['pnpm'],
        primary: 'react'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.commands).toHaveProperty('build');
    });

    it('should generate appropriate bundler-specific commands', () => {
      const detected = {
        languages: ['javascript'],
        frameworks: ['react'],
        testFrameworks: ['vitest'],
        bundlers: ['vite'],
        tools: ['npm'],
        primary: 'react'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('build');
      expect(config.commands).toHaveProperty('dev');
    });

    it('should handle missing dependencies gracefully', () => {
      const detected = {
        languages: [],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: [],
        primary: 'generic'
      };

      const generator = new JavaScriptConfigGenerator(detected);
      const config = generator.generate();

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config).toHaveProperty('claudeMdAdditions');
      expect(Array.isArray(config.hooks)).toBe(true);
      expect(typeof config.commands).toBe('object');
    });
  });

  describe('PythonConfigGenerator', () => {
    it('should generate Django project configuration', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['django'],
        testFrameworks: [],
        bundlers: [],
        tools: ['pip'],
        primary: 'django'
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config).toHaveProperty('claudeMdAdditions');
      expect(config.hooks).toContain('black --check .');
      expect(config.hooks).toContain('flake8 .');
      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.commands).toHaveProperty('migrate');
      expect(config.claudeMdAdditions).toContain('Django');
    });

    it('should generate Flask project configuration', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['flask'],
        testFrameworks: [],
        bundlers: [],
        tools: ['pip'],
        primary: 'flask'
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('black --check .');
      expect(config.hooks).toContain('flake8 .');
      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.claudeMdAdditions).toContain('Flask');
    });

    it('should generate FastAPI project configuration', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['fastapi'],
        testFrameworks: [],
        bundlers: [],
        tools: ['pip'],
        primary: 'fastapi'
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('black --check .');
      expect(config.hooks).toContain('flake8 .');
      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.claudeMdAdditions).toContain('FastAPI');
    });

    it('should handle pytest test framework', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['django'],
        testFrameworks: ['pytest'],
        bundlers: [],
        tools: ['pip'],
        primary: 'django'
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('test');
      expect(config.commands).toHaveProperty('coverage');
    });

    it('should handle mypy type checking', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['django'],
        testFrameworks: [],
        bundlers: [],
        tools: ['pip'],
        primary: 'django',
        hasMyPy: true
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('mypy .');
    });

    it('should handle virtual environment detection', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['django'],
        testFrameworks: [],
        bundlers: [],
        tools: ['pip'],
        primary: 'django',
        hasVirtualEnv: true
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.claudeMdAdditions).toContain('virtual environment');
      expect(config.commands).toHaveProperty('activate');
    });

    it('should handle poetry package manager', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['django'],
        testFrameworks: [],
        bundlers: [],
        tools: ['poetry'],
        primary: 'django'
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('install');
    });

    it('should handle pipenv package manager', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['django'],
        testFrameworks: [],
        bundlers: [],
        tools: ['pipenv'],
        primary: 'django'
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('install');
    });

    it('should generate generic Python configuration', () => {
      const detected = {
        languages: ['python'],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: ['pip'],
        primary: 'python'
      };

      const generator = new PythonConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('black --check .');
      expect(config.hooks).toContain('flake8 .');
      expect(config.commands).toHaveProperty('test');
      expect(config.claudeMdAdditions).toContain('Python');
    });
  });

  describe('RustConfigGenerator', () => {
    it('should generate Axum web server configuration', () => {
      const detected = {
        languages: ['rust'],
        frameworks: ['axum', 'tokio'],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust'
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config).toHaveProperty('claudeMdAdditions');
      expect(config.hooks).toContain('cargo clippy -- -D warnings -D clippy::all -D clippy::pedantic');
      expect(config.hooks).toContain('cargo fmt -- --check');
      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.claudeMdAdditions).toContain('Axum');
    });

    it('should generate Actix-web server configuration', () => {
      const detected = {
        languages: ['rust'],
        frameworks: ['actix-web'],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust'
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('dev');
      expect(config.commands).toHaveProperty('test');
      expect(config.claudeMdAdditions).toContain('Actix');
    });

    it('should handle async runtime configuration', () => {
      const detected = {
        languages: ['rust'],
        frameworks: ['tokio'],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust'
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.claudeMdAdditions).toContain('Tokio');
      expect(config.commands).toHaveProperty('dev');
    });

    it('should handle Diesel ORM configuration', () => {
      const detected = {
        languages: ['rust'],
        frameworks: ['diesel'],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust'
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('migration');
      expect(config.commands).toHaveProperty('setup');
      expect(config.claudeMdAdditions).toContain('Diesel');
    });

    it('should handle criterion benchmarking', () => {
      const detected = {
        languages: ['rust'],
        frameworks: [],
        testFrameworks: ['criterion'],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust'
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('bench');
      expect(config.claudeMdAdditions).toContain('Criterion');
    });

    it('should handle cross-compilation setup', () => {
      const detected = {
        languages: ['rust'],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust',
        hasCrossCompilation: true
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('build');
      expect(config.claudeMdAdditions).toContain('cross-compilation');
    });

    it('should handle workspace configuration', () => {
      const detected = {
        languages: ['rust'],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust',
        isWorkspace: true
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('test');
      expect(config.commands).toHaveProperty('build');
      expect(config.claudeMdAdditions).toContain('workspace');
    });

    it('should handle security audit tools', () => {
      const detected = {
        languages: ['rust'],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust',
        hasSecurityAudit: true
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.hooks).toContain('cargo audit || echo "cargo-audit not installed, skipping security audit"');
      expect(config.hooks).toContain('cargo deny check || echo "cargo-deny not installed, skipping license check"');
    });

    it('should handle release optimization', () => {
      const detected = {
        languages: ['rust'],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust'
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('build');
      expect(config.commands.build).toContain('--release');
    });

    it('should handle documentation generation', () => {
      const detected = {
        languages: ['rust'],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'rust'
      };

      const generator = new RustConfigGenerator(detected);
      const config = generator.generate();

      expect(config.commands).toHaveProperty('doc');
      expect(config.commands.doc).toContain('--open');
    });
  });

  describe('Configuration Validation', () => {
    it('should generate syntactically valid hook scripts', () => {
      const generators = [
        new JavaScriptConfigGenerator({ languages: ['javascript'], frameworks: ['react'], primary: 'react', tools: ['npm'] }),
        new PythonConfigGenerator({ languages: ['python'], frameworks: ['django'], primary: 'django', tools: ['pip'] }),
        new RustConfigGenerator({ languages: ['rust'], frameworks: [], primary: 'rust', tools: ['cargo'] })
      ];

      generators.forEach(generator => {
        const config = generator.generate();
        
        // Hooks should be valid shell commands
        config.hooks.forEach(hook => {
          expect(typeof hook).toBe('string');
          expect(hook.length).toBeGreaterThan(0);
          expect(hook).not.toContain(';;'); // No double semicolons
          expect(hook).not.toMatch(/^\s/); // No leading whitespace
        });

        // Commands should be valid
        Object.values(config.commands).forEach(command => {
          expect(typeof command).toBe('string');
          expect(command.length).toBeGreaterThan(0);
        });

        // CLAUDE.md additions should be meaningful
        expect(config.claudeMdAdditions).toBeDefined();
        expect(typeof config.claudeMdAdditions).toBe('string');
        expect(config.claudeMdAdditions.length).toBeGreaterThan(0);
      });
    });

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        { languages: [], frameworks: [], primary: 'generic', tools: [] },
        { languages: ['unknown'], frameworks: ['nonexistent'], primary: 'invalid', tools: ['fake'] },
        null,
        undefined
      ];

      [JavaScriptConfigGenerator, PythonConfigGenerator, RustConfigGenerator].forEach(GeneratorClass => {
        edgeCases.forEach(detected => {
          expect(() => {
            const generator = new GeneratorClass(detected);
            const config = generator.generate();
            expect(config).toHaveProperty('hooks');
            expect(config).toHaveProperty('commands');
          }).not.toThrow();
        });
      });
    });
  });

  describe('Performance Requirements', () => {
    it('should generate configuration in under 50ms', () => {
      const complexDetected = {
        languages: ['javascript', 'typescript'],
        frameworks: ['react', 'nextjs', 'express'],
        testFrameworks: ['jest', 'cypress', 'playwright'],
        bundlers: ['webpack', 'vite'],
        tools: ['npm', 'yarn'],
        primary: 'nextjs'
      };

      const startTime = performance.now();
      const generator = new JavaScriptConfigGenerator(complexDetected);
      const config = generator.generate();
      const endTime = performance.now();

      expect(config).toBeDefined();
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle large framework lists efficiently', () => {
      const largeDetected = {
        languages: ['javascript'],
        frameworks: Array(100).fill().map((_, i) => `framework-${i}`),
        testFrameworks: Array(50).fill().map((_, i) => `test-${i}`),
        bundlers: Array(20).fill().map((_, i) => `bundler-${i}`),
        tools: ['npm'],
        primary: 'javascript'
      };

      const startTime = performance.now();
      const generator = new JavaScriptConfigGenerator(largeDetected);
      const config = generator.generate();
      const endTime = performance.now();

      expect(config).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});