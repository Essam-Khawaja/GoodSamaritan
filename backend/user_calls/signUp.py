import json

import boto3

client = boto3.client("lambda")


def sign_up(email, password):
    payload = json.dumps({"email": email, "password": password})
    response = client.invoke(FunctionName="signUp", Payload=payload)
    response_data = json.loads(response["Payload"].read().decode("utf-8"))
    return response_data
