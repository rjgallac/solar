# FoxESS Prometheus Exporter

Run scripts from the project root.

## Quick run

```bash
# Run the main helper (one-off)
node main.js

# Run the Prometheus exporter (one-off)
node exporter.js
```

---

## Running on Linux (background & process management)

Prerequisites:
- Node.js installed (v14+)
- Install dependencies (from project root):

```bash
npm install axios
```

Run in background with nohup:

```bash
# start exporter in background, redirect output to exporter.log
nohup node exporter.js > exporter.log 2>&1 &

# list running node processes (filter for exporter)
ps aux | grep exporter.js

# stop by PID (replace <PID> with actual pid)
kill <PID>
```

Run with pm2 (recommended for production):

```bash
# install pm2 globally (one-time)
npm install -g pm2

# start exporter (pm2 will keep it running)
pm2 start exporter.js --name foxess-exporter

# view logs
pm2 logs foxess-exporter

# stop and remove
pm2 stop foxess-exporter
	- job_name: 'foxess_exporter'
		static_configs:
			- targets: ['localhost:9200']
pm2 delete foxess-exporter
```

Run as a systemd service (example): create `/etc/systemd/system/foxess-exporter.service` with:

```ini
[Unit]
Description=FoxESS Prometheus Exporter
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/projects/solar
ExecStart=/usr/bin/node /home/youruser/projects/solar/exporter.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable foxess-exporter
sudo systemctl start foxess-exporter
sudo journalctl -u foxess-exporter -f
```

Quick kill options:

```bash
# kill by process name (careful: kills any node matching string)
pkill -f exporter.js

# or find PID and kill
ps aux | grep exporter.js
kill <PID>
```

Notes:
- Fox ESS API limits are approximately 1440 calls/day per inverter (~1 call/min). Set `POLL_INTERVAL_MS` in `.env` or exporter to 60000 for 1m polling.
- Ensure your `.env` (containing `FOXESS_API_KEY` and `DEVICE_SN`) is present and secure.

---

## Docker usage

Build the image (from project root):

```bash
# build image
docker build -t foxess-exporter:latest .
```

Run the exporter container (preferred: pass secrets via env or mount .env):

```bash
# example using env vars (do NOT hardcode in production)
docker run -d \
	--name foxess-exporter \
	-p 9200:9200 \
	-e FOXESS_API_KEY="your_api_key_here" \
	-e DEVICE_SN="your_device_sn" \
	foxess-exporter:latest
```

Or using an env file mounted into the container (safer):

```bash
docker run -d \
	--name foxess-exporter \
	-p 9200:9200 \
	--env-file /path/to/.env \
	foxess-exporter:latest
```

If you run Prometheus with `--net=host` (your example), and the exporter is running on the same host (either via `docker run -d --net=host ...` or installed on the host), Prometheus can scrape `http://localhost:9200/metrics`.

Example Prometheus container run you provided (runs Prometheus on host network):

```bash
docker run -d \
	--name prometheus \
	--net=host \
	-v /opt/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
	-v /opt/prometheus/data:/prometheus \
	prom/prometheus
```

Prometheus scrape config example (add to `prometheus.yml`):

```yaml
scrape_configs:
	- job_name: 'foxess_exporter'
		static_configs:
			- targets: ['localhost:9200']
```


