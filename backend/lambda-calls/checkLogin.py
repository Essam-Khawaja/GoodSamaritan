import json

import boto3

client = boto3.client("lambda")


def check_login(email, password):
    payload = json.dumps({"email": email, "password": password})

    response = client.invoke(FunctionName="checkLogin", Payload=payload)

    if response["StatusCode"] == 200:
        payload = json.dumps({"email": email})
        response = client.invoke(FunctionName="getUser", Payload=payload)

        response_data = json.loads(response["Payload"].read().decode("utf-8"))
        body = json.loads(response_data.get("body", "{}"))

        user_data = body.get("user")

        with open("user.json", "w") as file:
            json.dump(user_data, file, indent=2)


check_login("testtest@gmail.com", "abcdef")
