# 🕸️ AWS-Powered Web Scraping System with ECS Fargate

This project demonstrates a scalable and production-ready architecture for automating web scraping tasks using AWS serverless services, container orchestration, and asynchronous messaging.

## 📦 Overview

This system allows users to submit scraping jobs (along with input files) through various channels like:

- Web or mobile frontends  
- Bots (e.g., Telegram)  
- RESTful APIs (via API Gateway)  

The job is then processed by a scraping container running in **AWS ECS Fargate**, using a task definition and environment variables injected dynamically from S3.

## 🧩 Architecture Diagram

![Architecture](https://raw.githubusercontent.com/RaigoXD/scraping-worker-ecs/refs/heads/main/assets/aws-scrapper-architecture.drawio.png)

## 🔧 Architecture Components

| Service | Purpose |
|--------|---------|
| **Lambda: aws-run-scrapper-lambda** | Receives job input (e.g., base64 file), uploads to S3, and sends a message to the SQS queue. |
| **Amazon SQS** | Decouples task ingestion and execution; holds job metadata like bucket name and file name. |
| **Lambda: aws-run-ecs-worker-lambda** | Triggered by SQS. It launches a containerized scraping task on ECS Fargate using the input. |
| **Amazon ECS (Fargate)** | Runs the scraping job as a container, using parameters passed in as command-line arguments or environment variables. |
| **AWS ECR** | Stores the Docker image for the scraping container. The scraper image is stored in ECR and is pulled by ECS Fargate when launching new tasks. |
| **Amazon S3** | Stores input files and optionally `.env` configuration files used during task execution. |

## 📂 Folder Structure

```
scraping-worker-ecs/
├── assets/                      # Static assets and resources
├── lambda_ecs_run_task_container/  # Lambda function for ECS task execution
├── lambda_add_queue_message/    # Lambda function for queue management
├── scrapper-form-submit/        # Backend form submission handler
├── form-frontend/              # Demo frontend application (deployed on Vercel)
├── env/                        # Environment configuration files
└── .gitignore                 # Git ignore rules
```

## 🚀 How It Works

1. **Job Submission**:  
   The user submits a request (via API, bot, or form) including the input file (base64 encoded) and filename.

2. **Job Queueing**:  
   `aws-run-scrapper-lambda` saves the file to S3 and queues the job in `aws-scrapper-queue.fifo`.

3. **Task Execution**:  
   `aws-run-ecs-worker-lambda` is triggered by the SQS message.  
   It launches a container in ECS Fargate using a task definition.  
   The task runs `main.py`, which reads the file and performs scraping.

4. **Environment Configuration**:  
   The ECS task uses `.env` files injected from S3 at runtime via `environmentFiles`.

5. **Optional**: Scraping results can be saved back to S3 or another service.

## 🧪 Sample ECS Command Override

```bash
python main.py <bucket_name> <file_name>
```

These are passed as container command overrides in the ECS run_task() call.

## 🎯 Frontend Demo

The project includes a demo frontend application located in the `form-frontend/` directory. This frontend is deployed on Vercel and serves as a testing interface for the scraping system. It provides a user-friendly way to:

- Submit scraping jobs
- Upload input files
- Monitor job status
- View results

The frontend is built with modern web technologies and is designed to showcase the system's capabilities in a production-like environment.

## 🔐 Environment Setup

1. Clone the repository
2. Set up your AWS credentials
3. Configure the necessary environment variables in the `env/` directory
4. Deploy the Lambda functions and ECS task definitions
5. Set up the SQS queue and S3 buckets
6. Deploy the frontend to Vercel (optional)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
