import json

import boto3

client = boto3.client("lambda")


def create_task(title, description, latitude, longitude, elo, org_id, time):
    payload = json.dumps(
        {
            "title": title,
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "elo": elo,
            "orgID": org_id,
            "time": time,
        }
    )
    response = client.invoke(FunctionName="createTask", Payload=payload)
    response_data = json.loads(response["Payload"].read().decode("utf-8"))
    return response_data
