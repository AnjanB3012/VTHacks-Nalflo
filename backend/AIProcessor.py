import ast
import json
import os
import requests
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Configuration dictionary for dashboard generation
DASHBOARD_CONFIG = {
        "model": "gemini-2.5-pro",
        "system_instruction": """You are an AI assistant designed to assist users with making a neatly formatted dashboard based on the apis they provide a neat dashboard for the user time to time when prompted by pulling the latest information from their APIs. If the user preferences below is set to None just generate the example format of dashboard that is below. If there are some API information provided, first pull the apis that are not destructive, pull only the apis that give you information like Databases, e-mails, etc... and use this information to construct the dashboard and it should be personalized to the user preferences given. You set the finished param to True if you have pulled all the necessary information and you generated the dashboard, until the finished is not set to true the grid size and tile params will not be evaluated so you can generate any placeholders or preparation content. If you want to make an api request you set the finished param to false and provide the endpoint you want to access and the body in a json format that can be parsed. For the coordinates param in the tiles make it as a nested list string which can be converted using ast.literal_eval.

    IMPORTANT API REQUEST FORMATTING:
    - When making API calls, the api_body must be a valid JSON object, not empty
    - Example api_body: {"action": "get_data", "params": {"limit": 100, "type": "analytics"}}
    - Always include meaningful parameters in the API request body
    - Use descriptive parameter names that match the API endpoint purpose

    Remember a few safety instructions as failing to adhere to them could break the system.
    - Remember to provide the coordinates as a nested list string which can be parsed by ast.literal_eval.
    - No 2 tiles should overlap in coordinates.
    - Remember to provide the api body request in json that can be parsed without errors.
    - NEVER leave api_body empty - always include relevant parameters for the API call.
    - When you can't fill all the tiles, use the example tiles to fill the gaps and be careful with the coordinates and html.

    Example dashboard:
    "tiles": [
            {
            "id": "analytics",
            "title": "Analytics Overview",
            "coordinates": [[0, 0], [1, 0], [1, 1], [0, 1]],
            "html": "<div class=\"tile-content graph-tile\"><div class=\"chart-placeholder\"><div class=\"chart-bars\"><div class=\"bar\" style=\"height: 60%\"></div><div class=\"bar\" style=\"height: 80%\"></div><div class=\"bar\" style=\"height: 45%\"></div><div class=\"bar\" style=\"height: 90%\"></div><div class=\"bar\" style=\"height: 70%\"></div></div><p class=\"chart-label\">Analytics Data</p></div></div>"
            },
            {
            "id": "user-stats",
            "title": "User Statistics",
            "coordinates": [[0, 2], [1, 2], [1, 2], [0, 2]],
            "html": "<div class=\"tile-content metric-tile\"><div class=\"metric-value\">1,234</div><div class=\"metric-label\">Active Users</div><div class=\"metric-trend positive\">+12%</div></div>"
            },
            {
            "id": "revenue",
            "title": "Revenue",
            "coordinates": [[0, 5], [0, 5], [0, 6], [0, 6]],
            "html": "<div class=\"tile-content metric-tile\"><div class=\"metric-value\">$45,678</div><div class=\"metric-label\">Monthly Revenue</div><div class=\"metric-trend positive\">+8%</div></div>"
            },
            {
            "id": "notifications",
            "title": "Recent Notifications",
            "coordinates": [[0, 3], [1, 3], [1, 4], [0, 4]],
            "html": "<div class=\"tile-content list-tile\"><ul class=\"list-items\"><li class=\"list-item\"><span class=\"list-bullet\">•</span>System update completed</li><li class=\"list-item\"><span class=\"list-bullet\">•</span>New user registered</li><li class=\"list-item\"><span class=\"list-bullet\">•</span>Payment processed</li></ul></div>"
            },
            {
            "id": "activity-feed",
            "title": "Activity Feed",
            "coordinates": [[2, 5], [3, 5], [3, 6], [2, 6]],
            "html": "<div class=\"tile-content activity-tile\"><div class=\"activity-items\"><div class=\"activity-item\"><div class=\"activity-user\">John Doe</div><div class=\"activity-action\">created project</div><div class=\"activity-time\">2m ago</div></div><div class=\"activity-item\"><div class=\"activity-user\">Jane Smith</div><div class=\"activity-action\">updated settings</div><div class=\"activity-time\">5m ago</div></div><div class=\"activity-item\"><div class=\"activity-user\">Mike Johnson</div><div class=\"activity-action\">uploaded file</div><div class=\"activity-time\">10m ago</div></div></div></div>"
            },
            {
            "id": "quick-actions",
            "title": "Quick Actions",
            "coordinates": [[2, 7], [3, 7], [3, 7], [2, 7]],
            "html": "<div class=\"tile-content buttons-tile\"><div class=\"button-grid\"><button class=\"tile-button\">New Project</button><button class=\"tile-button\">Export Data</button><button class=\"tile-button\">Settings</button></div></div>"
            },
            {
            "id": "weather",
            "title": "Weather",
            "coordinates": [[0, 7], [1, 7], [1, 7], [0, 7]],
            "html": "<div class=\"tile-content widget-tile\"><div class=\"widget-icon\">🌤️</div><div class=\"widget-location\">San Francisco</div><div class=\"widget-temp\">72°F</div><div class=\"widget-condition\">Sunny</div></div>"
            },
            {
            "id": "performance",
            "title": "Performance",
            "coordinates": [[1, 5], [1, 5], [1, 6], [1, 6]],
            "html": "<div class=\"tile-content metric-tile\"><div class=\"metric-value\">98.5%</div><div class=\"metric-label\">Uptime</div><div class=\"metric-trend positive\">+0.2%</div></div>"
            },
            {
            "id": "storage",
            "title": "Storage",
            "coordinates": [[2, 0], [3, 0], [3, 0], [2, 0]],
            "html": "<div class=\"tile-content metric-tile\"><div class=\"metric-value\">2.4TB</div><div class=\"metric-label\">Used Storage</div><div class=\"metric-trend positive\">+5%</div></div>"
            },
            {
            "id": "alerts",
            "title": "System Alerts",
            "coordinates": [[3, 3], [3, 3], [3, 4], [3, 4]],
            "html": "<div class=\"tile-content list-tile\"><ul class=\"list-items\"><li class=\"list-item\"><span class=\"list-bullet\">•</span>High CPU usage detected</li><li class=\"list-item\"><span class=\"list-bullet\">•</span>Database backup completed</li><li class=\"list-item\"><span class=\"list-bullet\">•</span>New user registration</li><li class=\"list-item\"><span class=\"list-bullet\">•</span>System maintenance scheduled</li></ul></div>"
            },
            {
            "id": "network",
            "title": "Network Traffic",
            "coordinates": [[2, 1], [3, 1], [3, 2], [2, 2]],
            "html": "<div class=\"tile-content graph-tile\"><div class=\"chart-placeholder\"><div class=\"chart-bars\"><div class=\"bar\" style=\"height: 60%\"></div><div class=\"bar\" style=\"height: 80%\"></div><div class=\"bar\" style=\"height: 45%\"></div><div class=\"bar\" style=\"height: 90%\"></div><div class=\"bar\" style=\"height: 70%\"></div></div><p class=\"chart-label\">Analytics Data</p></div></div>"
            },
            {
            "id": "security",
            "title": "Security Status",
            "coordinates": [[2, 3], [2, 3], [2, 4], [2, 4]],
            "html": "<div class=\"tile-content metric-tile\"><div class=\"metric-value\">Secure</div><div class=\"metric-label\">System Status</div><div class=\"metric-trend positive\">✓</div></div>"
            }
        ]

    User Preferences:

    None

    APIs available:

    None""",
        "user_input": "INSERT_INPUT_HERE",
        "user_preferences": None,
        "apis_available": None,
        "response_schema": {
            "type": "object",
            "required": ["gridSize", "tiles", "finished_or_make_api_call", "endpoint", "api_body"],
            "properties": {
                "gridSize": {
                    "type": "object",
                    "required": ["rows", "cols"],
                    "properties": {
                        "rows": {"type": "number"},
                        "cols": {"type": "number"}
                    }
                },
                "tiles": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["id", "title", "coordinates", "html"],
                        "properties": {
                            "id": {"type": "string"},
                            "title": {"type": "string"},
                            "coordinates": {"type": "string"},
                            "html": {"type": "string"}
                        }
                    }
                },
                "finished_or_make_api_call": {"type": "boolean"},
                "endpoint": {"type": "string"},
                "api_body": {"type": "string"}
            }
        }
    }

class AIProcessor:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.base_url = "http://localhost:8000"

    def parse_coordinates(self, coordinates_str):
        """Parse coordinates string using ast.literal_eval with error handling."""
        try:
            return ast.literal_eval(coordinates_str)
        except (ValueError, SyntaxError) as e:
            print(f"Error parsing coordinates '{coordinates_str}': {e}")
            return None

    def parse_api_body(self, api_body_str):
        """Parse API body string using ast.literal_eval with error handling."""
        try:
            return ast.literal_eval(api_body_str)
        except (ValueError, SyntaxError) as e:
            print(f"Error parsing API body '{api_body_str}': {e}")
            return None

    def process_dashboard_response(self, response_text):
        """Process the dashboard response and parse string parameters into proper data types."""
        try:
            # Parse the JSON response
            dashboard_data = json.loads(response_text)
            
            # Process tiles to parse coordinates
            if "tiles" in dashboard_data:
                for tile in dashboard_data["tiles"]:
                    if "coordinates" in tile and isinstance(tile["coordinates"], str):
                        parsed_coords = self.parse_coordinates(tile["coordinates"])
                        if parsed_coords is not None:
                            tile["coordinates"] = parsed_coords
            
            # Process API body if present
            if "api_body" in dashboard_data and isinstance(dashboard_data["api_body"], str):
                parsed_body = self.parse_api_body(dashboard_data["api_body"])
                if parsed_body is not None:
                    dashboard_data["api_body"] = parsed_body
            
            return dashboard_data
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            return None

    def make_api_call(self, endpoint, api_body):
        """Make a POST request to the specified endpoint with the given body."""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {'Content-Type': 'application/json'}
            
            print(f"Making API call to: {url}")
            print(f"Request body: {api_body}")
            
            response = requests.post(url, json=api_body, headers=headers, timeout=30)
            response.raise_for_status()
            
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json() if response.content else None,
                "text": response.text
            }
        except requests.exceptions.RequestException as e:
            print(f"API call failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "status_code": getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None
            }

    def generate_dashboard(self, user_input=None, user_preferences=None, apis_available=None, api_context=""):
        """Generate dashboard configuration using the dictionary-based approach."""
        # Use provided parameters or defaults from config
        input_text = user_input or DASHBOARD_CONFIG["user_input"]
        preferences = user_preferences or DASHBOARD_CONFIG["user_preferences"]
        apis = apis_available or DASHBOARD_CONFIG["apis_available"]
        
        # Build the system instruction with dynamic content
        system_instruction = DASHBOARD_CONFIG["system_instruction"]
        if preferences is not None:
            system_instruction += f"\n\nUser Preferences:\n\n{preferences}"
        else:
            system_instruction += "\n\nUser Preferences:\n\nNone"
        
        if apis is not None:
            system_instruction += f"\n\nAPIs available:\n\n{apis}"
        else:
            system_instruction += "\n\nAPIs available:\n\nNone"
        
        # Add API context if available
        if api_context:
            system_instruction += f"\n\nAPI Response Context:\n\n{api_context}"

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=input_text),
                ],
            ),
        ]
        
        # Convert response schema from dictionary to genai types
        schema_props = {}
        for key, value in DASHBOARD_CONFIG["response_schema"]["properties"].items():
            if key == "gridSize":
                schema_props[key] = genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    required=value["required"],
                    properties={
                        "rows": genai.types.Schema(type=genai.types.Type.NUMBER),
                        "cols": genai.types.Schema(type=genai.types.Type.NUMBER)
                    }
                )
            elif key == "tiles":
                schema_props[key] = genai.types.Schema(
                    type=genai.types.Type.ARRAY,
                    items=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        required=value["items"]["required"],
                        properties={
                            "id": genai.types.Schema(type=genai.types.Type.STRING),
                            "title": genai.types.Schema(type=genai.types.Type.STRING),
                            "coordinates": genai.types.Schema(type=genai.types.Type.STRING),
                            "html": genai.types.Schema(type=genai.types.Type.STRING)
                        }
                    )
                )
            elif key == "finished_or_make_api_call":
                schema_props[key] = genai.types.Schema(type=genai.types.Type.BOOLEAN)
            elif key == "endpoint":
                schema_props[key] = genai.types.Schema(type=genai.types.Type.STRING)
            elif key == "api_body":
                schema_props[key] = genai.types.Schema(type=genai.types.Type.STRING)

        generate_content_config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(
                thinking_budget=-1,
            ),
            response_mime_type="application/json",
            response_schema=genai.types.Schema(
                type=genai.types.Type.OBJECT,
                required=DASHBOARD_CONFIG["response_schema"]["required"],
                properties=schema_props
            ),
            system_instruction=[
                types.Part.from_text(text=system_instruction),
            ],
        )

        returnText = ""
        for chunk in self.client.models.generate_content_stream(
            model=DASHBOARD_CONFIG["model"],
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.text:
                returnText += chunk.text
        
        # Process the response to parse string parameters into proper data types
        processed_response = self.process_dashboard_response(returnText)
        return processed_response if processed_response is not None else returnText

    def call_ai(self, user_preferences=None, apis_available=None):
        """Main method that handles the AI conversation loop with API calls."""
        print("Starting AI conversation loop...")
        
        # Initial call to AI
        response = self.generate_dashboard(
            user_input="Generate a dashboard based on the provided APIs and user preferences.",
            user_preferences=user_preferences,
            apis_available=apis_available
        )
        
        if not response:
            print("Failed to get initial response from AI")
            return None
        
        api_context = ""
        max_iterations = 10  # Prevent infinite loops
        iteration = 0
        
        while iteration < max_iterations:
            iteration += 1
            print(f"\n--- Iteration {iteration} ---")
            
            # Check if AI wants to make an API call
            if not response.get("finished_or_make_api_call", True):
                endpoint = response.get("endpoint", "")
                api_body = response.get("api_body", {})
                
                if endpoint and api_body:
                    print(f"AI wants to call API: {endpoint}")
                    
                    # Make the API call
                    api_result = self.make_api_call(endpoint, api_body)
                    
                    # Add API result to context
                    api_context += f"\nAPI Call to {endpoint}:\n"
                    api_context += f"Request Body: {json.dumps(api_body, indent=2)}\n"
                    api_context += f"Response: {json.dumps(api_result, indent=2)}\n"
                    
                    # Call AI again with API context
                    response = self.generate_dashboard(
                        user_input="Continue processing with the API response data.",
                        user_preferences=user_preferences,
                        apis_available=apis_available,
                        api_context=api_context
                    )
                    
                    if not response:
                        print("Failed to get response from AI after API call")
                        break
                else:
                    print("AI wants to make API call but endpoint or body is missing")
                    break
            else:
                print("AI has finished processing and generated dashboard")
                break
        
        if iteration >= max_iterations:
            print("Reached maximum iterations, returning current response")
        
        return response

# Example usage
if __name__ == "__main__":
    # Example user preferences and APIs
    user_preferences = {
        "theme": "dark",
        "layout": "grid",
        "widgets": ["analytics", "notifications", "weather"]
    }
    
    apis_available = {
        "/api/users": "Get user statistics",
        "/api/analytics": "Get analytics data",
        "/api/notifications": "Get recent notifications"
    }
    
    # Create AIProcessor instance
    processor = AIProcessor()
    
    # Call AI with user preferences and APIs
    result = processor.call_ai(
        user_preferences=user_preferences,
        apis_available=apis_available
    )
    
    # Print the result
    print("\n" + "="*50)
    print("FINAL DASHBOARD RESULT:")
    print("="*50)
    print(json.dumps(result, indent=2))
    
    # Save to file
    with open("dashboard_result.json", "w") as f:
        json.dump(result, f, indent=2)
    print("\nResult saved to dashboard_result.json")