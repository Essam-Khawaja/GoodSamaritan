import json

import boto3

client = boto3.client("lambda")


def get_available_tasks():
    # TODO: Implement functionality
    payload = json.dumps({"user_id": "123"})
    response_data = client.invoke(FunctionName="getAvailableTasks", Payload=payload)
    body = json.loads(response_data.get("body", "{}"))
    tasks = body.get("tasks", {})

    return tasks


print(get_available_tasks())
