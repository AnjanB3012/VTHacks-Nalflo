from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

user_db = {
    "demo@nalflo.com": {
        "password": "demo123",
        "name": "Demo User",
        "email": "demo@nalflo.com",
        "dash_preferences": {},
        "APIs": {},
        "files": {}
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

# New APIs go here

@app.route('/test', methods=['POST'])
def testapi():
    try:
        if True:
            return True
        return False
    except Exception as e:
        return jsonify({"error": str(e)}), 500





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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)