Open-source framework and scripts for harvesting datasets into [PortalJS](https://portaljs.com).
This repo is designed as a **template** — fork or clone it to quickly set up your own dataset harvesting pipelines.

It includes:

* Reusable scripts for extracting datasets from common sources (APIs, CSVs, spreadsheets, etc.)
* A plug-and-play **ETL framework** for transforming and publishing datasets
* GitHub Actions workflow for automated harvesting
* Config-driven setup — no need to hard-wire pipelines

## 🚀 Quickstart

1. **Use this template**
   Click **“Use this template”** on GitHub to bootstrap your own repo.

2. **Configure harvesters**
   Edit `config.yml` to define dataset sources and pipelines:

   ```yaml
   sources:
     - name: world-bank
       type: api
       url: https://api.worldbank.org/v2/
       format: json
   ```

3. **Run**

TODO

4. **Automate with GitHub Actions**
   Push your repo — harvesting will run on schedule using the included workflow (`.github/workflows/harvest.yml`).

## 🛠 Features

* **Modular scripts** – add your own connectors or reuse provided ones
* **Config-driven** – no need to edit code for new datasets
* **CI/CD ready** – run pipelines directly in GitHub Actions
* **Extensible** – works with PortalJS or standalone

## 📦 Repo Structure

TODO

## 🤝 Contributing

PRs and new connectors welcome!
Please open an issue if you’d like to propose a new feature or source integration.

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.
