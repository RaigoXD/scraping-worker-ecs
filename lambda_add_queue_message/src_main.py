import json
import boto3
import base64
import uuid

queue_url = 'your_queue_url'

def lambda_handler(event, context):
    try:
        # Extract parameters from event
    
        _body = event.get('body', None)
        _body = json.loads(_body)

        print({
            'bucket_name': _body['bucket_name'],
            'file_name': _body['file_name']
        })
        

        bucket_name = _body['bucket_name']
        file_name = f"your_folder_in_bucket/{_body['file_name']}"
        file_content_base64 = _body['file_base64']

        # Decode base64 content
        file_content = base64.b64decode(file_content_base64)

        # Upload to S3
        s3 = boto3.client('s3')
        s3.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=file_content
        )

        print("File uploaded to S3: ", file_name)
        print("Sending message:", file_name)

        # Send message to SQS
        MessageDeduplicationId = str(uuid.uuid4())
        MessageGroupId = "your_message_group_id"

        sqs = boto3.client('sqs')
        response = sqs.send_message(
            MessageGroupId=MessageGroupId,
            MessageDeduplicationId=MessageDeduplicationId,
            QueueUrl=queue_url,
            MessageBody=json.dumps({
                "MessageGroupId": MessageGroupId,
                "MessageDeduplicationId": MessageDeduplicationId,
                "bucket_name": bucket_name,
                "file_name": file_name
                }
            )
        )

        print("Message sent to SQS: ", file_name)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'File uploaded successfully',
                'bucket': bucket_name,
                'key': file_name
            })
        }

    except Exception as e:
        print("Error:", str(e))
        _body.pop('file_base64', None)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'event': _body
            })
        }