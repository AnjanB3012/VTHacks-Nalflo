import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import Navbar from './Navbar'
import { defaultApiClient } from './ApiClient'
import './CreateNewAPI.css'

const CreateNewAPI = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    endpoint: '',
    functionName: '',
    code: '',
    description: '',
    bodyFormat: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCodeChange = (newCode) => {
    setFormData(prev => ({
      ...prev,
      code: newCode
    }))
  }

  const validateForm = () => {
    if (!formData.endpoint.startsWith('/')) {
      setError('Endpoint must start with /')
      return false
    }
    if (!formData.functionName.trim()) {
      setError('Function name is required')
      return false
    }
    if (!formData.code.trim()) {
      setError('Code is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await defaultApiClient.post('/create_api', {
        username: user.email,
        endpoint: formData.endpoint,
        function_name: formData.functionName,
        code: formData.code,
        description: formData.description,
        body_format: formData.bodyFormat
      })

      setSuccess(`API created successfully! Endpoint: ${formData.endpoint}`)
      
      // Reset form
      setFormData({
        endpoint: '',
        functionName: '',
        code: '',
        description: '',
        bodyFormat: ''
      })

      // Redirect to API Engine after 2 seconds
      setTimeout(() => {
        navigate('/api-engine')
      }, 2000)

    } catch (err) {
      setError(err.message || 'Failed to create API')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/api-engine')
  }

  return (
    <div className="create-api-page">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="create-api-content">
        <div className="create-api-header">
          <h1>Create New API</h1>
          <p>Define a new API endpoint with custom Python code</p>
        </div>

        <form onSubmit={handleSubmit} className="create-api-form">
          <div className="form-group">
            <label htmlFor="endpoint">API Endpoint *</label>
            <input
              type="text"
              id="endpoint"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleInputChange}
              placeholder="/api/v1/your-endpoint"
              required
            />
            <small>Must start with / (e.g., /api/v1/users)</small>
          </div>

          <div className="form-group">
            <label htmlFor="functionName">Function Name *</label>
            <input
              type="text"
              id="functionName"
              name="functionName"
              value={formData.functionName}
              onChange={handleInputChange}
              placeholder="handle_request"
              required
            />
            <small>Python function name that will handle the request</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">API Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this API does..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bodyFormat">Request Body Format</label>
            <textarea
              id="bodyFormat"
              name="bodyFormat"
              value={formData.bodyFormat}
              onChange={handleInputChange}
              placeholder='{"key": "value", "required": true}'
              rows="3"
            />
            <small>JSON format of the expected request body (optional)</small>
          </div>

          <div className="form-group">
            <label htmlFor="code">Python Code *</label>
            <div className="code-editor-container">
              <PythonCodeEditor
                value={formData.code}
                onChange={handleCodeChange}
                placeholder="# Example API function
def handle_request():
    # Get request data (if needed)
    # data = request.get_json()
    
    # Your API logic here
    result = {
        'message': 'Hello World',
        'status': 'success',
        'data': []
    }
    
    return result"
              />
            </div>
            <small>Write your Python function that handles the API request</small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating API...' : 'Create API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Monaco Editor Component for Python
const PythonCodeEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null)

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.5,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      hover: { enabled: true },
      contextmenu: true,
      mouseWheelZoom: true,
      smoothScrolling: true,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: true,
      renderLineHighlight: 'line',
      selectionHighlight: true,
      occurrencesHighlight: true,
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true,
        bracketPairsHorizontal: true
      }
    })

    // Set up Python-specific features
    monaco.languages.setLanguageConfiguration('python', {
      comments: {
        lineComment: '#',
        blockComment: ['"""', '"""']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: '"""', close: '"""' },
        { open: "'''", close: "'''" }
      ],
      surroundingPairs: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
        ['"', '"'],
        ["'", "'"]
      ],
      indentationRules: {
        increaseIndentPattern: /^\s*(def|class|if|elif|else|for|while|try|except|finally|with|async def).*:\s*$/,
        decreaseIndentPattern: /^\s*(elif|else|except|finally).*:\s*$/
      }
    })

    // Add Python snippets
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: () => {
        return {
          suggestions: [
            {
              label: 'def',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'def ${1:function_name}(${2:parameters}):\n    ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Define a function'
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'if ${1:condition}:\n    ${2:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If statement'
            },
            {
              label: 'for',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop'
            },
            {
              label: 'try',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Try-except block'
            }
          ]
        }
      }
    })
  }

  const handleEditorChange = (newValue) => {
    onChange(newValue || '')
  }

  return (
    <div className="monaco-editor-container">
      <div className="editor-header">
        <span className="editor-title">Python Code Editor</span>
        <span className="editor-language">Python</span>
      </div>
      <Editor
        height="400px"
        defaultLanguage="python"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
        }}
      />
    </div>
  )
}

export default CreateNewAPI
