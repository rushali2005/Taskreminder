import time
import schedule
import threading
from plyer import notification
import pyttsx3
import tkinter as tk
from tkinter import simpledialog

class TaskReminder:
    def __init__(self):
        self.tasks = []
        self.engine = pyttsx3.init()
        self.running = False

    def add_task(self, task, reminder_count):
        self.tasks.append({"task": task, "reminder_count": reminder_count})

    def show_popup(self, task):
        root = tk.Tk()
        root.withdraw()
        simpledialog.messagebox.showinfo("Task Reminder", f"Remember to: {task}")
        root.destroy()  # Destroy the Tk instance

    def voice_reminder(self, task):
        self.engine.say(f"Remember to {task}")
        self.engine.runAndWait()

    def notify(self, task):
        notification.notify(
            title="Task Reminder",
            message=f"Remember to: {task}",
            timeout=10
        )

    def remind(self, task):
        self.notify(task)
        self.show_popup(task)
        self.voice_reminder(task)

    def check_tasks(self):
        print("Checking tasks...")
        completed_tasks = []
        for task in self.tasks:
            if task["reminder_count"] > 0:
                self.remind(task["task"])
                task["reminder_count"] -= 1
            if task["reminder_count"] == 0:
                print(f"Task completed: {task['task']}")
                completed_tasks.append(task)

        # Remove completed tasks
        for task in completed_tasks:
            self.tasks.remove(task)

        # If no tasks left, stop reminder loop
        if not self.tasks:
            print("All tasks completed. Stopping reminder loop.")
            self.stop()

    def run_reminder_loop(self):
        if not self.running:
            self.running = True
            print("Reminder loop started")
            schedule.every(1).minutes.do(self.check_tasks)
            while self.running:
                schedule.run_pending()
                time.sleep(1)
            print("Reminder loop stopped")

    def start(self):
        thread = threading.Thread(target=self.run_reminder_loop)
        thread.start()

    def stop(self):
        self.running = False
