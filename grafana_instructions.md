Grafana tips for FoxESS metrics

- Prometheus metric name pattern used by the exporter: `foxess_<variable>` with label `deviceSN`.
- Suggested metrics to display:
  - `foxess_pvPower` (PV generation in W)
  - `foxess_batPower` (battery power W)
  - `foxess_meterPower2` (grid power W)
  - `foxess_soc` (battery state of charge %)
  - `foxess_device_status` (numeric device status)

Panel queries examples:
- Current PV: `avg by (deviceSN) (foxess_pvPower)`
- Battery SOC: `avg by (deviceSN) (foxess_soc)`
- Grid export/import: `avg by (deviceSN) (foxess_meterPower2)`

Notes:
- Exporter polls the Fox ESS API at the configured `POLL_INTERVAL_MS` (default 60000ms). Set Prometheus `scrape_interval` to match or be a divisor (e.g., both 60s).
- Respect Fox ESS limits: 1440 calls/day per inverter => 1 call/minute. If monitoring multiple devices, batch `sns` in one request to reduce calls.
- Run exporter as a background service (systemd/docker) on your Raspberry Pi and point Prometheus to it.
