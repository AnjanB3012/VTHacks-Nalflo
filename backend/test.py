from AIProcessor import AIProcessor
import json
ai_processor = AIProcessor()

value = ai_processor.call_ai({"requests": "Keep the weather widget to the left, and the analytics widget to the right."})

with open("dashboard_result.json", "w") as f:
    json.dump(value, f, indent=2)