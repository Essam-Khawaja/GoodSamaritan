import json

import boto3

client = boto3.client("lambda")
event = {"user_id": "barfafr", "name": "John Doe", "email": "john.doe@example.com"}

response = client.invoke(
    FunctionName="myUserTest",
    Payload=json.dumps(event).encode("utf-8"),
)
