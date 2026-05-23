/**
 * Prometheus-compatible metrics collection for BookMyService API
 * Exposes /api/metrics endpoint for scraping
 *
 * Provides:
 *   - Counters (monotonically increasing values)
 *   - Gauges (values that can go up or down)
 *   - Histograms (distribution of observed values)
 *
 * All metrics are stored in-memory and output in Prometheus exposition format
 * or JSON for API consumers.
 */

// ─── Label key helper ──────────────────────────────────────────────────────
function labelKey(name: string, labels: Record<string, string>): string {
  const sorted = Object.entries(labels)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
  if (sorted.length === 0) return name
  const suffix = sorted.map(([k, v]) => `${k}="${v}"`).join(',')
  return `${name}{${suffix}}`
}

// ─── Metrics Registry ──────────────────────────────────────────────────────

class MetricsRegistry {
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()

  // ── Counter: monotonically increasing ──────────────────────────────────

  incrementCounter(name: string, labels?: Record<string, string>, value = 1): void {
    const key = labelKey(name, labels || {})
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)
  }

  getCounter(name: string, labels?: Record<string, string>): number {
    const key = labelKey(name, labels || {})
    return this.counters.get(key) || 0
  }

  // ── Gauge: value that can go up or down ────────────────────────────────

  setGauge(name: string, labels: Record<string, string>, value: number): void {
    const key = labelKey(name, labels)
    this.gauges.set(key, value)
  }

  getGauge(name: string, labels: Record<string, string>): number {
    const key = labelKey(name, labels)
    return this.gauges.get(key) || 0
  }

  // ── Histogram: distribution of observed values ─────────────────────────

  observeHistogram(name: string, labels: Record<string, string>, value: number): void {
    const key = labelKey(name, labels)
    const existing = this.histograms.get(key) || []
    existing.push(value)
    this.histograms.set(key, existing)
  }

  // ── Prometheus exposition format ───────────────────────────────────────
  /**
   * Outputs all metrics in the Prometheus text exposition format.
   * See: https://prometheus.io/docs/instrumenting/exposition_formats/
   *
   * Counters → TYPE counter
   * Gauges   → TYPE gauge
   * Histograms → TYPE histogram (with _bucket, _sum, _count)
   */
  prometheusFormat(): string {
    const lines: string[] = []
    const seenNames = new Set<string>()

    // Default histogram buckets (in ms for durations)
    const DEFAULT_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]

    // Counters
    for (const [key, value] of this.counters) {
      const name = this._extractMetricName(key)
      if (!seenNames.has(name)) {
        lines.push(`# TYPE ${name} counter`)
        seenNames.add(name)
      }
      lines.push(`${key} ${value}`)
    }

    // Gauges
    for (const [key, value] of this.gauges) {
      const name = this._extractMetricName(key)
      if (!seenNames.has(name)) {
        lines.push(`# TYPE ${name} gauge`)
        seenNames.add(name)
      }
      lines.push(`${key} ${value}`)
    }

    // Histograms
    for (const [key, observations] of this.histograms) {
      const name = this._extractMetricName(key)
      const baseLabels = this._extractLabels(key)

      // _bucket le entries
      for (const le of DEFAULT_BUCKETS) {
        const count = observations.filter(v => v <= le).length
        const bucketLabels = { ...baseLabels, le: String(le) }
        lines.push(`${labelKey(name + '_bucket', bucketLabels)} ${count}`)
      }
      // +Inf bucket
      const infLabels = { ...baseLabels, le: '+Inf' }
      lines.push(`${labelKey(name + '_bucket', infLabels)} ${observations.length}`)

      // _sum
      const sum = observations.reduce((a, b) => a + b, 0)
      lines.push(`${labelKey(name + '_sum', baseLabels)} ${sum}`)

      // _count
      lines.push(`${labelKey(name + '_count', baseLabels)} ${observations.length}`)

      if (!seenNames.has(name)) {
        lines.unshift(`# TYPE ${name} histogram`)
        seenNames.add(name)
      }
    }

    return lines.join('\n') + '\n'
  }

  // ── JSON format for API responses ──────────────────────────────────────

  jsonFormat(): Record<string, any> {
    const result: Record<string, any> = {
      counters: {},
      gauges: {},
      histograms: {},
    }

    for (const [key, value] of this.counters) {
      result.counters[key] = value
    }

    for (const [key, value] of this.gauges) {
      result.gauges[key] = value
    }

    for (const [key, observations] of this.histograms) {
      const name = this._extractMetricName(key)
      const baseLabels = this._extractLabels(key)
      const sum = observations.reduce((a, b) => a + b, 0)
      const avg = observations.length > 0 ? sum / observations.length : 0
      const sorted = [...observations].sort((a, b) => a - b)
      const p50 = this._percentile(sorted, 50)
      const p95 = this._percentile(sorted, 95)
      const p99 = this._percentile(sorted, 99)

      result.histograms[key] = {
        name,
        labels: baseLabels,
        count: observations.length,
        sum,
        avg: Math.round(avg * 100) / 100,
        min: observations.length > 0 ? sorted[0] : 0,
        max: observations.length > 0 ? sorted[sorted.length - 1] : 0,
        p50: Math.round(p50 * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
      }
    }

    return result
  }

  // ── Summary for health dashboard ───────────────────────────────────────

  summaryFormat(): {
    totalRequests: number
    totalErrors: number
    avgResponseTimeMs: number
    p95ResponseTimeMs: number
    p99ResponseTimeMs: number
    activeConnections: number
    bookingsCreated: number
    paymentsProcessed: number
    notificationsSent: number
    cacheHitRate: number
  } {
    // Total requests
    let totalRequests = 0
    for (const [key, value] of this.counters) {
      if (key.startsWith('http_requests_total')) totalRequests += value
    }

    // Total errors (4xx + 5xx)
    let totalErrors = 0
    for (const [key, value] of this.counters) {
      if (key.startsWith('http_requests_total')) {
        // Extract status from label
        const statusMatch = key.match(/status="(\d+)"/)
        if (statusMatch) {
          const status = parseInt(statusMatch[1])
          if (status >= 400) totalErrors += value
        }
      }
    }

    // Response time from histogram
    let allDurations: number[] = []
    for (const [key, observations] of this.histograms) {
      if (key.startsWith('http_request_duration_ms')) {
        allDurations = allDurations.concat(observations)
      }
    }
    const sorted = allDurations.sort((a, b) => a - b)
    const avgResponseTimeMs = allDurations.length > 0
      ? Math.round((allDurations.reduce((a, b) => a + b, 0) / allDurations.length) * 100) / 100
      : 0
    const p95ResponseTimeMs = Math.round(this._percentile(sorted, 95) * 100) / 100
    const p99ResponseTimeMs = Math.round(this._percentile(sorted, 99) * 100) / 100

    // Active connections from gauge
    let activeConnections = 0
    for (const [key, value] of this.gauges) {
      if (key.startsWith('active_connections')) activeConnections = value
    }

    // Bookings created
    let bookingsCreated = 0
    for (const [key, value] of this.counters) {
      if (key.startsWith('bookings_created_total')) bookingsCreated += value
    }

    // Payments processed
    let paymentsProcessed = 0
    for (const [key, value] of this.counters) {
      if (key.startsWith('payments_processed_total')) paymentsProcessed += value
    }

    // Notifications sent
    let notificationsSent = 0
    for (const [key, value] of this.counters) {
      if (key.startsWith('notifications_sent_total')) notificationsSent += value
    }

    // Cache hit rate
    let cacheHits = 0
    let cacheMisses = 0
    for (const [key, value] of this.counters) {
      if (key.startsWith('cache_hits_total')) cacheHits += value
      if (key.startsWith('cache_misses_total')) cacheMisses += value
    }
    const cacheTotal = cacheHits + cacheMisses
    const cacheHitRate = cacheTotal > 0 ? Math.round((cacheHits / cacheTotal) * 10000) / 100 : 0

    return {
      totalRequests,
      totalErrors,
      avgResponseTimeMs,
      p95ResponseTimeMs,
      p99ResponseTimeMs,
      activeConnections,
      bookingsCreated,
      paymentsProcessed,
      notificationsSent,
      cacheHitRate,
    }
  }

  // ── Reset all metrics (for testing) ────────────────────────────────────

  reset(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
  }

  // ── Internal helpers ───────────────────────────────────────────────────

  private _extractMetricName(key: string): string {
    const braceIdx = key.indexOf('{')
    return braceIdx > 0 ? key.substring(0, braceIdx) : key
  }

  private _extractLabels(key: string): Record<string, string> {
    const braceIdx = key.indexOf('{')
    if (braceIdx < 0) return {}
    const inner = key.substring(braceIdx + 1, key.length - 1)
    const labels: Record<string, string> = {}
    for (const pair of inner.split(',')) {
      const eqIdx = pair.indexOf('=')
      if (eqIdx > 0) {
        const k = pair.substring(0, eqIdx).trim()
        const v = pair.substring(eqIdx + 1).trim().replace(/^"|"$/g, '')
        labels[k] = v
      }
    }
    return labels
  }

  private _percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)]
  }
}

// ─── Singleton Registry ────────────────────────────────────────────────────

export const registry = new MetricsRegistry()

// ─── Pre-defined API Metrics ───────────────────────────────────────────────

export const apiMetrics = {
  /** Increment HTTP request counter */
  httpRequestsTotal: (method: string, path: string, status: number) =>
    registry.incrementCounter('http_requests_total', { method, path, status: String(status) }),

  /** Observe HTTP request duration in milliseconds */
  httpRequestDuration: (method: string, path: string, durationMs: number) =>
    registry.observeHistogram('http_request_duration_ms', { method, path }, durationMs),

  /** Observe database query duration in milliseconds */
  dbQueryDuration: (query: string, durationMs: number) =>
    registry.observeHistogram('db_query_duration_ms', { query_type: query.split(' ')[0] }, durationMs),

  /** Record a cache hit */
  cacheHits: (key: string) =>
    registry.incrementCounter('cache_hits_total', { key_prefix: key.split(':')[0] }),

  /** Record a cache miss */
  cacheMisses: (key: string) =>
    registry.incrementCounter('cache_misses_total', { key_prefix: key.split(':')[0] }),

  /** Set the number of active connections */
  activeConnections: (count: number) =>
    registry.setGauge('active_connections', {}, count),

  /** Record a queue job event */
  queueJobsTotal: (queue: string, status: string) =>
    registry.incrementCounter('queue_jobs_total', { queue, status }),

  /** Record a booking creation */
  bookingCreated: () =>
    registry.incrementCounter('bookings_created_total'),

  /** Record a payment processing event */
  paymentProcessed: (method: string, status: string) =>
    registry.incrementCounter('payments_processed_total', { method, status }),

  /** Record a notification sent */
  notificationSent: (channel: string, status: string) =>
    registry.incrementCounter('notifications_sent_total', { channel, status }),
}

// ─── Export Helpers ─────────────────────────────────────────────────────────

export function getMetricsPrometheus(): string {
  return registry.prometheusFormat()
}

export function getMetricsJSON(): Record<string, any> {
  return registry.jsonFormat()
}

export function getMetricsSummary(): ReturnType<MetricsRegistry['summaryFormat']> {
  return registry.summaryFormat()
}
