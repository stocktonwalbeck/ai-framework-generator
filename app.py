from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import openai
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure OpenAI
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Framework types and their definitions
FRAMEWORK_TYPES = {
    "linear": {
        "name": "Linear",
        "description": "A finite, one-way sequence of steps that must be completed in order",
        "characteristics": ["Causality", "Irreversibility", "Completion Trigger"],
        "ideal_steps": "3-8 steps",
        "examples": ["Design Thinking", "Sales Pipeline", "Product Launch"]
    },
    "non_linear": {
        "name": "Non-Linear",
        "description": "Independent elements that can be used in any order or combination",
        "characteristics": ["Order-agnostic", "Equal weight", "Re-mixability"],
        "ideal_steps": "4-9 pillars",
        "examples": ["7 Habits", "McKinsey 7-S", "Marketing 4 Ps"]
    },
    "cyclical": {
        "name": "Cyclical",
        "description": "A closed loop where the output feeds back into the first stage",
        "characteristics": ["Recurrence", "Feedback", "Momentum over Completion"],
        "ideal_steps": "3-6 segments",
        "examples": ["PDCA Cycle", "Habit Loop", "Agile Sprint"]
    },
    "hierarchical": {
        "name": "Hierarchical",
        "description": "Stacked levels where higher tiers include or supersede lower ones",
        "characteristics": ["Containment", "Priority/Status", "Directional Advancement"],
        "ideal_steps": "3-7 tiers",
        "examples": ["Maslow's Hierarchy", "Bloom's Taxonomy", "Skill Levels"]
    },
    "matrix": {
        "name": "Matrix",
        "description": "Two or more axes mapping ideas for diagnosis and prioritization",
        "characteristics": ["Orthogonal Axes", "Quadrants/Zones", "Placement over Progression"],
        "ideal_steps": "2x2 to 5x5 grid",
        "examples": ["Eisenhower Matrix", "BCG Matrix", "SWOT Analysis"]
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/framework-types')
def get_framework_types():
    return jsonify(FRAMEWORK_TYPES)

@app.route('/api/generate-framework', methods=['POST'])
def generate_framework():
    try:
        data = request.get_json()
        framework_type = data.get('type')
        industry = data.get('industry', '')
        purpose = data.get('purpose', '')
        target_audience = data.get('target_audience', '')
        complexity = data.get('complexity', 'medium')
        
        if not framework_type or framework_type not in FRAMEWORK_TYPES:
            return jsonify({'error': 'Invalid framework type'}), 400
        
        # Build the prompt based on the framework type
        framework_info = FRAMEWORK_TYPES[framework_type]
        
        prompt = f"""Create a {framework_info['name']} framework for {industry} with the following specifications:

PURPOSE: {purpose}
TARGET AUDIENCE: {target_audience}
COMPLEXITY LEVEL: {complexity}

FRAMEWORK TYPE REQUIREMENTS:
- Type: {framework_info['name']}
- Description: {framework_info['description']}
- Key Characteristics: {', '.join(framework_info['characteristics'])}
- Ideal Size: {framework_info['ideal_steps']}

Based on the comprehensive framework guide, create a complete framework that includes:

1. FRAMEWORK NAME: A catchy, memorable name using one of these methodologies:
   - Client-Identity (e.g., "Agency-Owner Profit Path")
   - Acronym (e.g., "S.T.A.R. Success System")
   - Number-Phase (e.g., "5-Step Growth Model")
   - Alliteration (e.g., "Profit Pipeline Process")
   - Anti-/"No-" (e.g., "No-Hustle Revenue Framework")

2. FRAMEWORK ELEMENTS: Create the appropriate number of steps/pillars/tiers/quadrants for the {framework_type} type:
   {get_framework_specific_instructions(framework_type)}

3. ELEMENT DETAILS: For each element, provide:
   - Clear, action-oriented name
   - Brief description (1-2 sentences)
   - Key activities or indicators
   - Success criteria or outcomes

4. VISUAL CONCEPT: Suggest one of the 12 visual concepts from the {framework_type} gallery that would work best

5. IMPLEMENTATION GUIDANCE:
   - When to use this framework
   - Best practices for teaching/using it
   - Common pitfalls to avoid

Please format the response as a structured JSON object with the following keys:
- name
- type
- description
- elements (array of objects with name, description, activities, success_criteria)
- visual_concept
- when_to_use
- best_practices
- pitfalls
- psychology_principle (why this framework type works psychologically)

Make it specific to {industry} and ensure it follows the {framework_type} principles exactly."""

        # Make the OpenAI API call
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        
        response = client.chat.completions.create(
            model="o3",
            messages=[
                {"role": "system", "content": "You are an expert framework designer who creates comprehensive, actionable frameworks based on established framework principles. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Parse the response
        framework_text = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = framework_text.find('{')
            end_idx = framework_text.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = framework_text[start_idx:end_idx]
                framework_data = json.loads(json_str)
            else:
                # If no JSON found, create a structured response
                framework_data = parse_text_response(framework_text, framework_type, industry)
        except json.JSONDecodeError:
            # Fallback: parse the text response manually
            framework_data = parse_text_response(framework_text, framework_type, industry)
        
        # Ensure all required fields are present
        framework_data = validate_framework_data(framework_data, framework_type)
        
        return jsonify(framework_data)
        
    except Exception as e:
        print(f"Error generating framework: {str(e)}")
        return jsonify({'error': 'Failed to generate framework'}), 500

def get_framework_specific_instructions(framework_type):
    instructions = {
        "linear": "Create 3-8 sequential steps where each step unlocks the next. Use action verbs and ensure clear causality.",
        "non_linear": "Create 4-9 independent pillars/principles that can be used in any order. Ensure each pillar stands alone and provides value independently.",
        "cyclical": "Create 3-6 stages that form a continuous loop where the last stage feeds back into the first. Show how each cycle improves upon the last.",
        "hierarchical": "Create 3-7 tiers where each higher level contains or supersedes the benefits of lower levels. Show clear advancement path.",
        "matrix": "Create a 2x2 or larger grid with two independent axes. Define clear quadrants with actionable labels and strategic implications."
    }
    return instructions.get(framework_type, "Create appropriate framework elements.")

def parse_text_response(text, framework_type, industry):
    """Fallback parser for non-JSON responses"""
    return {
        "name": f"{industry} {FRAMEWORK_TYPES[framework_type]['name']} Framework",
        "type": framework_type,
        "description": f"A {framework_type} framework designed for {industry}",
        "elements": [
            {
                "name": f"Element {i+1}",
                "description": "Framework element description",
                "activities": ["Key activity"],
                "success_criteria": "Success measure"
            } for i in range(4)
        ],
        "visual_concept": "Standard visual representation",
        "when_to_use": f"Use when working in {industry}",
        "best_practices": ["Follow framework principles"],
        "pitfalls": ["Avoid common mistakes"],
        "psychology_principle": f"Leverages {framework_type} psychology principles"
    }

def validate_framework_data(data, framework_type):
    """Ensure the framework data has all required fields"""
    required_fields = ['name', 'type', 'description', 'elements']
    for field in required_fields:
        if field not in data:
            data[field] = f"Default {field}"
    
    if 'elements' not in data or not isinstance(data['elements'], list):
        data['elements'] = []
    
    # Ensure elements have required structure
    for element in data['elements']:
        if not isinstance(element, dict):
            continue
        element.setdefault('name', 'Framework Element')
        element.setdefault('description', 'Element description')
        element.setdefault('activities', ['Key activity'])
        element.setdefault('success_criteria', 'Success measure')
    
    # Ensure consistent data types
    data.setdefault('visual_concept', 'Standard visual representation')
    data.setdefault('when_to_use', 'General use cases')
    data.setdefault('psychology_principle', 'Psychological foundation')
    
    # Convert string responses to arrays for consistency
    if 'best_practices' in data and isinstance(data['best_practices'], str):
        data['best_practices'] = [data['best_practices']]
    else:
        data.setdefault('best_practices', ['Follow best practices'])
    
    if 'pitfalls' in data and isinstance(data['pitfalls'], str):
        data['pitfalls'] = [data['pitfalls']]
    else:
        data.setdefault('pitfalls', ['Avoid common mistakes'])
    
    return data

@app.route('/api/examples')
def get_examples():
    """Get example frameworks for each type"""
    examples = {
        "linear": {
            "name": "Design Thinking 5-Step Process",
            "elements": ["Empathise", "Define", "Ideate", "Prototype", "Test"]
        },
        "non_linear": {
            "name": "Marketing 4 Ps",
            "elements": ["Product", "Price", "Place", "Promotion"]
        },
        "cyclical": {
            "name": "PDCA Improvement Cycle",
            "elements": ["Plan", "Do", "Check", "Act"]
        },
        "hierarchical": {
            "name": "Maslow's Hierarchy of Needs",
            "elements": ["Physiological", "Safety", "Love/Belonging", "Esteem", "Self-Actualization"]
        },
        "matrix": {
            "name": "Eisenhower Matrix",
            "elements": ["Do First", "Schedule", "Delegate", "Delete"]
        }
    }
    return jsonify(examples)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(debug=False, port=port, host='0.0.0.0') 