import json

import boto3

client = boto3.client("lambda")


def remove_task(task_id):
    payload = json.dumps(
        {
            "taskID": task_id,
        }
    )

    response = client.invoke(FunctionName="removeTask", Payload=payload)
    response_data = json.loads(response["Payload"].read().decode("utf-8"))

    return response_data
