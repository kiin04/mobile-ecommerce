# 🛒 Mobile Ecommerce 



### 📖 Project Overview
This project is a high-performance, scalable mobile ecommerce platform. The core focus was not only building a feature-rich store but also engineering a sophisticated CI/CD infrastructure to ensure rapid, reliable, and observable software delivery.

### 🌟 Key Achievements
- Performance Optimization: Achieved a 68% reduction in deployment time by refactoring GitLab CI/CD workflows and implementing parallel builds.

- Full Automation: Leveraged GitLab Runners to automate the entire lifecycle: Code Pulling → Docker Image Building → Artifact Pushing (Docker Hub) → Automated Production Deployment.

- System Observability: Established a robust monitoring stack using Prometheus and Grafana, reducing Mean Time to Detection (MTTD) for system issues.

### 🛠 Tech Stack
<div align="center">
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/_net_core.png" alt=".NET Core" title=".NET Core"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/react.png" alt="React" title="React"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/mssql.png" alt="MSSQL" title="MSSQL"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/linux.png" alt="Linux" title="Linux"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/ubuntu.png" alt="Ubuntu" title="Ubuntu"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/git.png" alt="Git" title="Git"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/gitlab.png" alt="GitLab" title="GitLab"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png" alt="Docker" title="Docker"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/grafana.png" alt="Grafana" title="Grafana"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/prometheus.png" alt="Prometheus" title="Prometheus"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/nginx.png" alt="Nginx" title="Nginx"/></code>
</div>

### 🏗 CI/CD Architecture
The pipeline is designed with a modular approach, using the include strategy to manage microservices (Backend, Admin, and User) independently.

Stage - Build: Detects changes in specific directories (WebAPI/, admin/, user/) and builds optimized Docker images using Multi-stage builds.

Stage - Push: Images are tagged and pushed to Docker Hub with latest and commit-sha tags.

Stage - Deploy: The runner communicates via SSH to the production server, pulls the latest images, and restarts services using docker-compose.


### 📊 Monitoring & Observability
We don't just deploy; we monitor. By integrating Node Exporter, Prometheus, and Grafana, the system provides real-time insights into server health.

Uptime Tracking: Instant alerts if any service (Backend/Frontend) goes down.

Resource Management: Real-time monitoring of RAM and CPU usage to prevent bottlenecks.

## 🖼️ Project Gallery

<details>
<summary><b>📱 User Interface & Admin Dashboard</b> (Click to expand)</summary>
<br>
<p align="center">
  <img src="https://github.com/user-attachments/assets/40c7ecf0-3c4d-40e5-bb0b-3affcc8b47bf" width="80%" alt="Admin Dashboard" />
  <br><i>Admin Dashboard Overview</i>
</p>
</details>

<details>
<summary><b>🚀 CI/CD Pipeline & DevOps</b> (Click to expand)</summary>
<br>
<p align="center">
  <img src="https://github.com/user-attachments/assets/7423c47a-7034-4489-8ac9-6ffa96252f95" width="80%" alt="GitLab Pipeline" />
  <br><i>Automated Pipeline with Build & Deploy Stages</i>
</p>
</details>

<details>
<summary><b>📊 Monitoring (Grafana & Prometheus)</b> (Click to expand)</summary>
<br>
<p align="center">
  <img src="https://github.com/user-attachments/assets/81c3fdf5-76f8-4f32-9928-5b92124c3701" width="80%" alt="Grafana Metrics" />
  <br><i>Real-time System Monitoring</i>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/0846c7ad-c878-4d95-99f4-153ed8a90be1" width="80%" alt="Alerting Status" />
  <br><i>Service Health & Alerting Configuration</i>
</p>
</details>

<details>
<summary><b>📦 Container Registry (Docker Hub)</b> (Click to expand)</summary>
<br>
<p align="center">
  <img src="https://github.com/user-attachments/assets/fc511362-19ec-41fb-9169-596c1c049d34" width="80%" alt="Docker Hub" />
  <br><i>Docker Images stored in Docker Hub</i>
</p>
</details>





















