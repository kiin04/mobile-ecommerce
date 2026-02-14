### 🛒 Mobile Ecommerce 

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


### Gemini said
Here is a professional and impactful README.md file in English for your project. This is structured to highlight your technical expertise, especially your impressive 68% deployment time reduction.

🛒 Mobile Ecommerce System
Full-stack Ecommerce Platform with Automated DevOps Pipeline Timeline: July 2025 – October 2025

📖 Project Overview
This project is a high-performance, scalable mobile ecommerce platform. The core focus was not only building a feature-rich store but also engineering a sophisticated CI/CD infrastructure to ensure rapid, reliable, and observable software delivery.

🌟 Key Achievements
Performance Optimization: Achieved a 68% reduction in deployment time by refactoring GitLab CI/CD workflows and implementing parallel builds.

Full Automation: Leveraged GitLab Runners to automate the entire lifecycle: Code Pulling → Docker Image Building → Artifact Pushing (Docker Hub) → Automated Production Deployment.

System Observability: Established a robust monitoring stack using Prometheus and Grafana, reducing Mean Time to Detection (MTTD) for system issues.

🛠 Tech Stack
The system is built with a modern, distributed architecture:

Backend: ASP.NET Core (Web API)

Frontend: React.js powered by Vite (optimized for fast HMR and builds)

Database: MySQL

DevOps & Infrastructure:

Containerization: Docker & Docker Compose

CI/CD: GitLab CI/CD with custom GitLab Runners

Registry: Docker Hub

Monitoring: Prometheus (Metrics collection) & Grafana (Visualization)

🏗 CI/CD Architecture
The pipeline is designed with a modular approach, using the include strategy to manage microservices (Backend, Admin, and User) independently.

Stage - Build: Detects changes in specific directories (WebAPI/, admin/, user/) and builds optimized Docker images using Multi-stage builds.

Stage - Push: Images are tagged and pushed to Docker Hub with latest and commit-sha tags.

Stage - Deploy: The runner communicates via SSH to the production server, pulls the latest images, and restarts services using docker-compose.

📊 Monitoring & Observability
We don't just deploy; we monitor. By integrating Node Exporter, Prometheus, and Grafana, the system provides real-time insights into server health.

Uptime Tracking: Instant alerts if any service (Backend/Frontend) goes down.

Resource Management: Real-time monitoring of RAM and CPU usage to prevent bottlenecks.

Alerting: Configured Alert Rules to notify the team via Telegram/Email when thresholds are breached.








