from utils.agent_nodes.agent_workflow import run_learning_cycle

# Replace with a real user ID from your DB
user_id = "692555a6d2b83dd605f9629d"

project = run_learning_cycle(user_id)
print("Recommended project:", project)