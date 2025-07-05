/**
 * Modern Rust 2025 Plugin
 * 
 * Provides comprehensive Rust development configuration and best practices
 * Supports Rust 2024 edition with latest tooling and patterns (July 2025)
 * Includes async closures, Cargo AI plugins, and expert practices
 */

const BaseConfigurationPlugin = require('../base-configuration-plugin');

class RustPlugin extends BaseConfigurationPlugin {
  constructor() {
    super('rust');
    
    this.config = {
      // Rust 2024 Edition Configuration
      edition: '2024',
      
      // Modern toolchain configuration (2025)
      toolchain: {
        channel: 'stable',
        components: ['rustfmt', 'clippy', 'rust-analyzer', 'rust-src'],
        targets: [], // Additional targets can be specified per project
        aiPlugins: {
          enabled: true,
          features: ['code-completion', 'refactoring-suggestions', 'dependency-analysis'],
          config: {
            'rust-analyzer.experimental.procAttrMacros': true,
            'rust-analyzer.cargo.features': 'all',
            'rust-analyzer.checkOnSave.command': 'clippy'
          }
        }
      },
      
      // Quality standards and linting configuration
      quality: {
        clippy: {
          lints: ['clippy::all', 'clippy::pedantic', 'clippy::nursery'],
          deny: ['warnings'],
          allowList: [] // Project-specific exceptions
        },
        rustfmt: {
          edition: '2024',
          styleEdition: '2024'
        },
        testing: {
          allFeatures: true,
          allTargets: true,
          docTests: true
        }
      },
      
      // Modern Rust crate recommendations by category
      recommendedCrates: {
        // Web development stack (2025 expert choice)
        web: {
          framework: 'axum',
          version: '^0.8', // Latest stable with async closures support
          features: ['macros', 'ws', 'json'],
          middleware: { crate: 'tower-http', version: '^0.6', features: ['cors', 'trace', 'request-id'] },
          alternatives: ['actix-web', 'warp', 'rocket']
        },
        
        // Async runtime
        async: {
          runtime: 'tokio',
          version: '^1.0',
          features: ['full'],
          alternatives: ['async-std', 'smol']
        },
        
        // Error handling
        errorHandling: {
          application: { crate: 'anyhow', version: '^1.0' },
          library: { crate: 'thiserror', version: '^1.0' },
          reporting: { crate: 'eyre', version: '^0.6' }
        },
        
        // Serialization
        serialization: {
          standard: { crate: 'serde', version: '^1.0', features: ['derive'] },
          json: { crate: 'serde_json', version: '^1.0' },
          binary: { crate: 'postcard', version: '^1.0' }
        },
        
        // CLI development
        cli: {
          parser: { crate: 'clap', version: '^4.0', features: ['derive'] },
          colors: { crate: 'owo-colors', version: '^4.0' },
          progress: { crate: 'indicatif', version: '^0.17' }
        },
        
        // Testing and benchmarking (2025 expert tools)
        testing: {
          runner: { crate: 'cargo-nextest', version: '^0.9', install: 'cargo install cargo-nextest' },
          parametric: { crate: 'rstest', version: '^0.18' },
          property: { crate: 'proptest', version: '^1.0' },
          benchmark: { crate: 'criterion', version: '^0.5' },
          mocking: { crate: 'mockall', version: '^0.11' },
          coverage: { crate: 'cargo-llvm-cov', version: '^0.6', install: 'cargo install cargo-llvm-cov' }
        },
        
        // Database access
        database: {
          async: { crate: 'sqlx', version: '^0.7', features: ['runtime-tokio-rustls', 'postgres', 'chrono', 'uuid'] },
          orm: { crate: 'sea-orm', version: '^0.12' },
          legacy: { crate: 'diesel', version: '^2.1' }
        },
        
        // Concurrency and parallelism
        concurrency: {
          parallel: { crate: 'rayon', version: '^1.8' },
          lockfree: { crate: 'crossbeam', version: '^0.8' },
          sync: { crate: 'parking_lot', version: '^0.12' }
        }
      },
      
      // Development workflow commands (2025 expert practices)
      commands: {
        dev: 'cargo run',
        'dev-watch': 'cargo watch -x run',
        test: 'cargo nextest run --all-features', // Modern test runner (2025)
        'test-legacy': 'cargo test --all-features', // Fallback for compatibility
        'test-watch': 'cargo watch -x "nextest run --all-features"',
        build: 'cargo build --release --all-features',
        lint: 'cargo clippy --all-targets --all-features -- -D warnings -D clippy::all -D clippy::pedantic',
        format: 'cargo fmt',
        'format-check': 'cargo fmt -- --check',
        bench: 'cargo bench',
        doc: 'cargo doc --open --all-features',
        audit: 'cargo audit',
        outdated: 'cargo outdated',
        clean: 'cargo clean',
        'security-check': 'cargo audit && cargo deny check',
        flamegraph: 'cargo flamegraph',
        'test-coverage': 'cargo llvm-cov nextest --all-features --html',
        'deps-tree': 'cargo tree',
        'deps-update': 'cargo update',
        'ai-assist': 'cargo --help | grep -E "(nextest|audit|deny|flamegraph)"' // Check AI-enhanced tools
      },
      
      // Project templates and structure
      projectStructure: {
        binary: {
          src: ['main.rs', 'lib.rs', 'config.rs', 'error.rs'],
          modules: ['handlers/', 'models/', 'services/', 'utils/'],
          tests: ['integration/', 'common/']
        },
        library: {
          src: ['lib.rs', 'error.rs'],
          modules: ['core/', 'utils/'],
          tests: ['integration/', 'common/']
        }
      },
      
      // Code generation templates
      templates: {
        errorType: {
          application: 'anyhow::Result<T>',
          library: 'thiserror-based custom error enum'
        },
        asyncClosure: 'async || {} // Stabilized in Rust 1.85 (February 2025)',
        modernAsyncIterator: 'futures::stream::iter(items).then(async |item| process(item)).collect().await',
        testStructure: 'rstest + proptest pattern'
      },
      
      // Performance and optimization settings
      optimization: {
        release: {
          lto: true,
          codegen_units: 1,
          panic: 'abort'
        },
        debug: {
          debug_assertions: true,
          overflow_checks: true
        }
      }
    };
    
    // JSON Schema for validation
    this.schema = {
      type: 'object',
      properties: {
        edition: { type: 'string', enum: ['2015', '2018', '2021', '2024'] },
        toolchain: {
          type: 'object',
          properties: {
            channel: { type: 'string', enum: ['stable', 'beta', 'nightly'] },
            components: { type: 'array', items: { type: 'string' } },
            targets: { type: 'array', items: { type: 'string' } }
          }
        },
        quality: {
          type: 'object',
          properties: {
            clippy: {
              type: 'object',
              properties: {
                lints: { type: 'array', items: { type: 'string' } },
                deny: { type: 'array', items: { type: 'string' } },
                allowList: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      required: ['edition', 'toolchain', 'quality']
    };
  }
  
  /**
   * Get recommended crates for a specific use case
   * @param {string} category - Category of crates (web, async, cli, etc.)
   * @returns {Object} Recommended crates configuration
   */
  getRecommendedCrates(category) {
    return this.config.recommendedCrates[category] || {};
  }
  
  /**
   * Get modern Rust patterns and idioms
   * @returns {Object} Code patterns and examples
   */
  getModernPatterns() {
    return {
      errorHandling: {
        application: `
// Application error handling with anyhow
use anyhow::{Context, Result};

fn process_data() -> Result<Data> {
    let config = load_config()
        .context("Failed to load configuration")?;
    
    let data = fetch_data(&config)
        .context("Failed to fetch data from API")?;
    
    Ok(data)
}`,
        library: `
// Library error handling with thiserror
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ProcessError {
    #[error("Configuration error: {message}")]
    Config { message: String },
    
    #[error("Network error")]
    Network(#[from] reqwest::Error),
    
    #[error("Parsing error")]
    Parse(#[from] serde_json::Error),
}`
      },
      
      asyncClosure: `
// Modern async closures (Rust 1.85 - February 2025)
async fn process_items(items: Vec<Item>) -> Vec<Result<ProcessedItem>> {
    let processors = items.into_iter().map(async |item| {
        process_item(item).await  // No explicit move needed in Rust 1.85+
    });
    
    futures::future::join_all(processors).await
}

// Advanced async iterator pattern
async fn process_stream(items: Vec<Item>) -> Vec<ProcessedItem> {
    futures::stream::iter(items)
        .then(async |item| process_item(item).await)
        .collect()
        .await
}`,
      
      modernWebHandler: `
// Modern Axum handler with tower-http integration (2025)
use axum::{
    extract::{Path, State},
    response::Result,
    Json,
};
use tower_http::trace::TraceLayer;
use tower_http::request_id::{MakeRequestUuid, PropagateRequestIdLayer};

async fn get_user(
    Path(id): Path<UserId>,
    State(db): State<Database>,
) -> Result<Json<User>> {
    let user = db.get_user(id)
        .await
        .context("Failed to fetch user")?;
    
    Ok(Json(user))
}

// Router with modern middleware stack
fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/users/:id", get(get_user))
        .with_state(state)
        .layer(
            ServiceBuilder::new()
                .set_x_request_id(MakeRequestUuid)
                .layer(PropagateRequestIdLayer::x_request_id())
                .layer(TraceLayer::new_for_http())
        )
}`
    };
  }
  
  /**
   * Generate project-specific Cargo.toml recommendations
   * @param {string} projectType - Type of project (binary, library, workspace)
   * @param {Array} features - Required features/categories
   * @returns {Object} Cargo.toml configuration
   */
  generateCargoConfig(projectType = 'binary', features = []) {
    const baseConfig = {
      package: {
        edition: this.config.edition,
        'rust-version': '1.85' // Minimum version for async closures (February 2025)
      },
      dependencies: {},
      'dev-dependencies': {
        rstest: '0.18',
        proptest: '1.0',
        criterion: '0.5'
      }
    };
    
    // Add recommended crates based on features (2025 stack)
    if (features.includes('web')) {
      Object.assign(baseConfig.dependencies, {
        axum: { version: '0.8', features: ['macros', 'ws'] },
        tokio: { version: '1.0', features: ['full'] },
        tower: '0.4',
        'tower-http': { version: '0.6', features: ['cors', 'trace', 'request-id'] },
        'tower-service': '0.3',
        anyhow: '1.0',
        futures: '0.3' // For async closures and streams
      });
    }
    
    if (features.includes('cli')) {
      Object.assign(baseConfig.dependencies, {
        clap: { version: '4.0', features: ['derive'] },
        'owo-colors': '4.0',
        anyhow: '1.0'
      });
    }
    
    if (features.includes('database')) {
      Object.assign(baseConfig.dependencies, {
        sqlx: { 
          version: '0.7', 
          features: ['runtime-tokio-rustls', 'postgres', 'chrono', 'uuid'] 
        }
      });
    }
    
    return baseConfig;
  }
}

module.exports = RustPlugin;