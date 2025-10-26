// Unified Learning System - Entry Point
// Export only core integration components
// Note: content-generator and report-generator are excluded to prevent
// Anthropic client initialization in browser environment

export * from './types';
export { learningIntegrationService, LearningIntegrationService } from './integration-service';

// AI generators should be imported directly when needed on server-side:
// import { aiContentGenerator } from './content-generator';
// import { unifiedReportGenerator } from './report-generator';
