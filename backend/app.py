from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json
from datetime import datetime, timezone
from AIProcessor import AIProcessor
import requests

app = Flask(__name__)

CORS(app)  # Enable CORS for all routes

user_db = {
    "demo@nalflo.com": {
        "password": "demo123",
        "name": "Demo User",
        "email": "demo@nalflo.com",
        "dash_preferences": {"user_input": ""},
        "APIs": {},
        "files": {},
        "last_login": datetime.now(timezone.utc).timestamp(),
        "latest_dashboard": None
    }
}

def save_server():
    with open("server.json", "w") as f:
        json.dump(user_db, f, indent=2)

if not os.path.exists("server.json"):
    save_server()

def load_server():
    with open("server.json", "r") as f:
        user_db = json.load(f)
    return user_db

user_db = load_server()

processor = AIProcessor()

def refresh_dashboard(username):
    if username not in user_db:
        return jsonify({"error": "User not found"}), 404
    apis = user_db[username]['APIs']
    apis_available = {}
    for api in apis:
        apis_available[api] = apis[api]['description']+ "\n" + "Request body: " + apis[api]['body_format']
    response = processor.call_ai(user_preferences=user_db[username]['dash_preferences'], apis_available=apis_available)
    user_db[username]['latest_dashboard'] = response
    save_server()
    return jsonify({"message": "Dashboard refreshed successfully"}), 200

# New APIs go here


@app.route('/create_api', methods=['POST'])
def create_api():
    data = request.get_json()
    username = data.get('username')
    endpoint = data.get('endpoint')
    function_name = data.get('function_name')
    code = data.get('code')
    description = data.get('description')
    body_format = data.get('body_format')
    
    # Validate endpoint starts with /
    if not endpoint.startswith('/'):
        return jsonify({"error": "Endpoint must start with /"}), 400
    
    # Check if endpoint already exists for any user
    for user_email, user_data in user_db.items():
        if 'APIs' in user_data and endpoint in user_data['APIs']:
            return jsonify({"error": f"Endpoint {endpoint} already exists for user {user_email}"}), 400
    
    # Add API to user's APIs
    if username not in user_db:
        return jsonify({"error": "User not found"}), 404
    
    # Store API information
    api_info = {
        "description": description,
        "code": code,
        "function_name": function_name,
        "body_format": body_format
    }
    
    user_db[username]['APIs'][endpoint] = api_info
    
    # Save server before writing API to file
    save_server()
    
    # Write the API code to app.py file
    try:
        write_api_to_file(endpoint, function_name, code)
        return jsonify({"message": "API created successfully", "endpoint": endpoint}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to write API to file: {str(e)}"}), 500

def write_api_to_file(endpoint, function_name, code):
    """Write API code to app.py file for persistence"""
    app_py_path = os.path.join(os.path.dirname(__file__), 'app.py')
    
    # Read current file content
    with open(app_py_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the insertion point (after "# New APIs go here")
    insertion_point = content.find('# New APIs go here')
    if insertion_point == -1:
        raise Exception("Could not find insertion point in app.py")
    
    # Find the end of the line after the comment
    line_end = content.find('\n', insertion_point)
    if line_end == -1:
        line_end = len(content)
    
    # Create the API route code
    route_name = endpoint.replace('/', '_').replace('-', '_').strip('_')
    if not route_name:
        route_name = 'root'
    
    # Properly indent the user's code while preserving relative indentation
    lines = code.split('\n')
    indented_lines = []
    
    # Find the minimum indentation level (excluding empty lines)
    min_indent = float('inf')
    for line in lines:
        if line.strip():  # Non-empty line
            leading_spaces = len(line) - len(line.lstrip())
            min_indent = min(min_indent, leading_spaces)
    
    # If no non-empty lines found, set min_indent to 0
    if min_indent == float('inf'):
        min_indent = 0
    
    # Process each line: remove common indentation, then add 8 spaces for try block
    for line in lines:
        if line.strip():  # Non-empty line
            # Remove the common minimum indentation, then add 8 spaces
            relative_indent = len(line) - len(line.lstrip()) - min_indent
            indented_lines.append('        ' + ' ' * relative_indent + line.strip())
        else:  # Empty line
            indented_lines.append('')
    
    indented_code = '\n'.join(indented_lines)
    
    api_code = f"""
@app.route('{endpoint}', methods=['POST'])
def {function_name}():
    try:
{indented_code}
    except Exception as e:
        return jsonify({{"error": str(e)}}), 500

"""
    
    # Insert the API code
    new_content = content[:line_end + 1] + api_code + content[line_end + 1:]
    
    # Write back to file
    with open(app_py_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def update_api_code_in_file(endpoint, function_name, new_code):
    """Update existing API code in app.py file"""
    app_py_path = os.path.join(os.path.dirname(__file__), 'app.py')
    
    # Read current file content
    with open(app_py_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the function definition
    function_pattern = f"@app.route\\('{re.escape(endpoint)}'.*?\\ndef {function_name}\\(\\):"
    function_match = re.search(function_pattern, content, re.DOTALL)
    
    if not function_match:
        raise Exception(f"Could not find function {function_name} for endpoint {endpoint}")
    
    # Find the start of the try block
    try_start = content.find("try:", function_match.end())
    if try_start == -1:
        raise Exception("Could not find try block in function")
    
    # Find the except block
    except_pattern = r"\s*except Exception as e:"
    except_match = re.search(except_pattern, content[try_start:])
    if not except_match:
        raise Exception("Could not find except block in function")
    
    except_start = try_start + except_match.start()
    
    # Properly indent the new code
    lines = new_code.split('\n')
    indented_lines = []
    
    # Find the minimum indentation level (excluding empty lines)
    min_indent = float('inf')
    for line in lines:
        if line.strip():  # Non-empty line
            leading_spaces = len(line) - len(line.lstrip())
            min_indent = min(min_indent, leading_spaces)
    
    # If no non-empty lines found, set min_indent to 0
    if min_indent == float('inf'):
        min_indent = 0
    
    # Process each line: remove common indentation, then add 8 spaces for try block
    for line in lines:
        if line.strip():  # Non-empty line
            # Remove the common minimum indentation, then add 8 spaces
            relative_indent = len(line) - len(line.lstrip()) - min_indent
            indented_lines.append('        ' + ' ' * relative_indent + line.strip())
        else:  # Empty line
            indented_lines.append('')
    
    indented_code = '\n'.join(indented_lines)
    
    # Replace the code between try: and except
    try_line_end = content.find('\n', try_start + 4)  # +4 for "try:"
    new_content = content[:try_line_end + 1] + indented_code + '\n    ' + content[except_start:]
    
    # Write back to file
    with open(app_py_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def remove_api_from_file(endpoint, function_name):
    """Remove API code from app.py file"""
    app_py_path = os.path.join(os.path.dirname(__file__), 'app.py')
    
    # Read current file content
    with open(app_py_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the function definition pattern
    function_pattern = f"@app.route\\('{re.escape(endpoint)}'.*?\\ndef {function_name}\\(\\):.*?except Exception as e:.*?return jsonify\\(.*?\\), 500\\s*"
    
    # Use DOTALL flag to match across multiple lines
    function_match = re.search(function_pattern, content, re.DOTALL)
    
    if not function_match:
        raise Exception(f"Could not find function {function_name} for endpoint {endpoint} in file")
    
    # Remove the entire function (including route decorator and exception handling)
    new_content = content[:function_match.start()] + content[function_match.end():]
    
    # Clean up any extra blank lines that might be left
    new_content = re.sub(r'\n\n\n+', '\n\n', new_content)
    
    # Write back to file
    with open(app_py_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

# System APIs go here
@app.route('/')
def index():
    return "Hello, World!"

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username in user_db and user_db[username]['password'] == password:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    user_db[username] = {"password": password, "name": name, "email": username, "dash_preferences": {}, "APIs": {}, "files": {}}
    save_server()
    return jsonify({"message": "Signup successful"}), 200

@app.route('/get_apis', methods=['POST'])
def get_apis():
    data = request.get_json()
    username = data.get('username')
    return jsonify({"APIs": user_db[username]['APIs']}), 200

@app.route('/get_files', methods=['POST'])
def get_files():
    data = request.get_json()
    username = data.get('username')
    return jsonify({"files": user_db[username]['files']}), 200

@app.route('/save_server', methods=['POST'])
def save_server_endpoint():
    try:
        save_server()
        return jsonify({"message": "Server saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to save server: {str(e)}"}), 500

@app.route('/update_api_code', methods=['POST'])
def update_api_code():
    data = request.get_json()
    username = data.get('username')
    endpoint = data.get('endpoint')
    code = data.get('code')
    
    if username not in user_db:
        return jsonify({"error": "User not found"}), 404
    
    if endpoint not in user_db[username]['APIs']:
        return jsonify({"error": "API not found"}), 404
    
    # Update the code in user's API
    user_db[username]['APIs'][endpoint]['code'] = code
    
    # Save server
    save_server()
    
    # Update the API code in app.py file
    try:
        function_name = user_db[username]['APIs'][endpoint]['function_name']
        update_api_code_in_file(endpoint, function_name, code)
        return jsonify({"message": "API code updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update API code in file: {str(e)}"}), 500

@app.route('/remove_api', methods=['POST'])
def remove_api():
    data = request.get_json()
    username = data.get('username')
    endpoint = data.get('endpoint')
    
    if username not in user_db:
        return jsonify({"error": "User not found"}), 404
    
    if endpoint not in user_db[username]['APIs']:
        return jsonify({"error": "API not found"}), 404
    
    # Save server before removal
    save_server()
    
    # Get function name before removing from dict
    function_name = user_db[username]['APIs'][endpoint]['function_name']
    
    # Remove from user's APIs dictionary
    del user_db[username]['APIs'][endpoint]
    
    # Save server after removal from dict
    save_server()
    
    # Remove the API code from app.py file
    try:
        remove_api_from_file(endpoint, function_name)
        return jsonify({"message": "API removed successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to remove API from file: {str(e)}"}), 500

@app.route('/pinglogin', methods=['POST'])
def pinglogin():
    data = request.get_json()
    username = data.get('username')
    user_db[username]['last_login'] = datetime.now(timezone.utc).timestamp()
    save_server()
    return jsonify({"message": "Login successful"}), 200

@app.route('/get_dashboard', methods=['POST'])
def get_dashboard():
    data = request.get_json()
    username = data.get('username')
    if user_db[username]['latest_dashboard'] is None:
        refresh_dashboard(username)
    elif user_db[username]['last_login'] < datetime.now(timezone.utc).timestamp() - 10800:
        refresh_dashboard(username)
    return jsonify({"dashboard": user_db[username]['latest_dashboard']}), 200

@app.route('/get_user_dash_config', methods=['POST'])
def get_user_dash_config():
    data = request.get_json()
    username = data.get('username')
    return jsonify({"dash_config": user_db[username]['dash_preferences']['user_input']}), 200

@app.route('/update_user_dash_config', methods=['POST'])
def update_user_dash_config():
    data = request.get_json()
    username = data.get('username')
    user_input = data.get('user_input')
    user_db[username]['dash_preferences']['user_input'] = user_input
    save_server()
    return jsonify({"message": "User dashboard config updated successfully"}), 200

@app.route('/force_refresh_dashboard', methods=['POST'])
def force_refresh_dashboard():
    data = request.get_json()
    username = data.get('username')
    refresh_dashboard(username)
    return jsonify({"message": "Dashboard refreshed successfully"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)