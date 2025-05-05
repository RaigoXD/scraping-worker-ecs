import json
import boto3
import logging

# Setup logging
logging.basicConfig()
logger = logging.getLogger()
logging.getLogger("botocore").setLevel(logging.ERROR)
logger.setLevel(logging.INFO)

# Define subnets and security groups (from your config)
SUBNETS = ['your subnets']

SECURITY_GROUPS = ["your security groups"]

# ECS config
CLUSTER = "your cluster"
TASK_DEFINITION = "your task definition"
CONTAINER_NAME = "your container name" 

def lambda_handler(event, context):
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        _body = json.loads(event["Records"][0]["body"])


        bucket = _body['bucket_name']
        file_name = _body['file_name']

        container_command = [
            "python",
            "main.py",
            bucket,
            file_name
        ]

        ecs = boto3.client("ecs")

        response = ecs.run_task(
            cluster=CLUSTER,
            launchType="FARGATE",
            taskDefinition=TASK_DEFINITION,
            networkConfiguration={
                "awsvpcConfiguration": {
                    "subnets": SUBNETS,
                    "securityGroups": SECURITY_GROUPS,
                    "assignPublicIp": "ENABLED"
                }
            },
            overrides={
                "containerOverrides": [
                    {
                        "name": CONTAINER_NAME,
                        "command": container_command
                    }
                ]
            }
        )

        logger.info("ECS Task launched")

        task_arn = response['tasks'][0]['taskArn'] if response['tasks'] else None

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "ECS task started successfully",
                "task_arn": task_arn
            })
        }

    except Exception as e:
        logger.error(f"Error launching ECS task: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
