import csv
import io
import os
import boto3


aws_default_region = os.getenv("AWS_DEFAULT_REGION", None)
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", None)
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", None)

session = boto3.Session(
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=aws_default_region,
)

s3 = session.resource('s3')

def read_csv_from_s3(bucket_name, file_key) -> list[dict]:
    """Reads a CSV file from S3 and returns a list of dictionaries representing the rows.

    Args:
        bucket_name (str): The name of the S3 bucket.
        file_key (str): The key of the CSV file in the S3 bucket.

    Returns:
        list: A list of dictionaries representing the rows in the CSV file.
    """
    obj = s3.Object(bucket_name, file_key)
    data = obj.get()['Body'].read().decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(data))
    return [row for row in csv_reader]
