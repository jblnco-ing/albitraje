import os
import argparse
from pathlib import Path

GITHUB_WORKFLOW_TEMPLATE = """name: CI/CD Pipeline

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
        
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
        pip install freqtrade flake8
        
    - name: Lint with flake8
      run: |
        # stop the build if there are Python syntax errors or undefined names
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        # exit-zero treats all errors as warnings.
        flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

  build-docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker Image
      run: docker build . --file Dockerfile --tag my-freqtrade-bot:latest
"""


def generate_pipeline(project_path, type_):
    print(f"Generating {type_} pipeline in {project_path}...")

    workflows_dir = Path(project_path) / ".github" / "workflows"
    workflows_dir.mkdir(parents=True, exist_ok=True)

    workflow_file = workflows_dir / "ci_cd.yml"

    if workflow_file.exists():
        print(f"WARNING: {workflow_file} already exists.")
        overwrite = input("Overwrite? (y/n): ")
        if overwrite.lower() != "y":
            print("Aborted.")
            return

    with open(workflow_file, "w", encoding="utf-8") as f:
        f.write(GITHUB_WORKFLOW_TEMPLATE)

    print(f"✅ Pipeline generated at {workflow_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate CI/CD Pipelines")
    parser.add_argument("--path", default=".", help="Project root path")
    parser.add_argument("--type", default="freqtrade", help="Project type (default: freqtrade)")

    args = parser.parse_args()
    generate_pipeline(args.path, args.type)
