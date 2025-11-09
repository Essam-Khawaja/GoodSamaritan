import json

import boto3

client = boto3.client("lambda")


def get_user_tasks(userID, longitude, latitude):
    # TODO: Implement functionality
    payload = json.dumps(
        {"userID": userID, "longitude": longitude, "latitude": latitude}
    )
    response_data = client.invoke(FunctionName="getUserTasks", Payload=payload)
    body = json.loads(response_data.get("body", "{}"))

    tasks = body.get("tasks")

    return tasks
