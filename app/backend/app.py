from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests for React Native

@app.route('/task-summary')
def task_summary():
    # Simulated task data
    tasks = [
        {'id': 1, 'status': 'completed', 'completed_at': '2024-04-01'},
        {'id': 2, 'status': 'pending'},
        {'id': 3, 'status': 'completed', 'completed_at': '2024-04-10'},
        {'id': 4, 'status': 'completed', 'completed_at': '2024-04-18'},
        {'id': 5, 'status': 'pending'}
    ]

    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t['status'] == 'completed'])
    pending_tasks = total_tasks - completed_tasks
    recent_completions = 0
    completion_by_day = {}

    today = datetime.now()
    week_ago = today - timedelta(days=7)

    for task in tasks:
        if task['status'] == 'completed' and 'completed_at' in task:
            completed_at = datetime.strptime(task['completed_at'], "%Y-%m-%d")
            date_str = completed_at.strftime("%Y-%m-%d")
            completion_by_day[date_str] = completion_by_day.get(date_str, 0) + 1
            if completed_at >= week_ago:
                recent_completions += 1

    accuracy_percentage = round((completed_tasks / total_tasks) * 100) if total_tasks else 0

    return jsonify({
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'accuracy_percentage': accuracy_percentage,
        'completion_by_day': completion_by_day,
        'recent_completions': recent_completions
    })

if __name__ == '__main__':
    app.run(debug=True)
