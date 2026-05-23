-- Migration 015: Full Audit columns für project_intelligence
-- Erweitert bestehende Tabelle um tiefe Analyse-Felder

ALTER TABLE project_intelligence
  ADD COLUMN IF NOT EXISTS copy_analysis    jsonb,
  ADD COLUMN IF NOT EXISTS workflow_analysis jsonb,
  ADD COLUMN IF NOT EXISTS speed_data        jsonb,
  ADD COLUMN IF NOT EXISTS full_report       jsonb,
  ADD COLUMN IF NOT EXISTS crawl_pages       jsonb,
  ADD COLUMN IF NOT EXISTS audit_version     integer DEFAULT 1;

COMMENT ON COLUMN project_intelligence.copy_analysis    IS 'AI-Analyse von Headlines, CTAs, Wording, Value Prop';
COMMENT ON COLUMN project_intelligence.workflow_analysis IS 'AI-Vorschläge für Workflow-Automationen + AI-Integrationen';
COMMENT ON COLUMN project_intelligence.speed_data        IS 'Response-Time, Content-Größe, Resource-Count';
COMMENT ON COLUMN project_intelligence.full_report       IS 'Zusammenfassung, Top-Prioritäten, Executive Summary';
COMMENT ON COLUMN project_intelligence.crawl_pages       IS 'Gecrawlte Seiten mit je Meta/Content-Daten';
COMMENT ON COLUMN project_intelligence.audit_version     IS 'Versionierung für spätere Re-Audits';
