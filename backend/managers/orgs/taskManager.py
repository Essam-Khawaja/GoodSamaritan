# TODO: Make all necessary task management functions public and connect them to
# the task manager for ease of use via taskmanager.createTask() for example
# also handles org data handling to send the necessary data to the backend
import sys
from pathlib import Path

from org_calls.completeTask import complete_task
from org_calls.createTask import create_task
from org_calls.removeTask import remove_task

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))


class TaskManager:
    def __init__(self) -> None:
        pass

    def create_task(self, title, description, latitude, longitude, elo, org_id, time):
        try:
            response = create_task(
                title, description, latitude, longitude, elo, org_id, time
            )

            return {
                "message": "Task created successfully.",
                "data": response,
            }
        except Exception as e:
            return {
                "error": str(e),
                "message": "An error occurred while creating the task.",
            }

    def remove_task(self, task_id):
        try:
            response = remove_task(task_id)

            return {
                "message": "Task removed successfully.",
                "data": response,
            }
        except Exception as e:
            return {
                "error": str(e),
                "message": "An error occurred while removing the task.",
            }

    def complete_task(self, task_id):
        try:
            response = complete_task(task_id)

            return {
                "message": "Task completed successfully.",
                "data": response,
            }
        except Exception as e:
            return {
                "error": str(e),
                "message": "An error occurred while completing the task.",
            }


task_manager = TaskManager()
