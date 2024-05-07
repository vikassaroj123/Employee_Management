from flask import Flask, Blueprint, request, jsonify
from flask_pymongo import PyMongo
from bson import ObjectId

app = Flask(__name__)

# Configure the MongoDB URI
app.config['MONGO_URI'] = 'mongodb://localhost:27017/trial'

# Initialize PyMongo
mongo = PyMongo(app)

# Define the routes blueprint
routes_bp = Blueprint('routes', __name__)

# Health check route
@routes_bp.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running"}), 200

# Route to get employees
@routes_bp.route('/employees', methods=['GET'])
def get_employees():
    name_filter = request.args.get('name')
    salary_filter = request.args.get('salary')

    # Build the query based on filters
    query = {}
    if name_filter:
        query['name'] = {'$regex': name_filter, '$options': 'i'}
    
    if salary_filter:
        try:
            salary_filter = float(salary_filter)
            query['salary'] = {'$gte': salary_filter}
        except ValueError:
            return jsonify({'error': 'Invalid salary filter'}), 400

    # Retrieve employees from the database
    employees = list(mongo.db.employees.find(query))
    
    # Convert ObjectId to string in the response
    for employee in employees:
        employee['_id'] = str(employee['_id'])
    
    return jsonify(employees)

# Route to add a new employee
@routes_bp.route('/employees', methods=['POST'])
def add_employee():
    data = request.json

    # Validate data
    if 'name' not in data or 'salary' not in data:
        return jsonify({'error': 'Name and salary are required'}), 400

    # Insert the new employee into the database
    result = mongo.db.employees.insert_one(data)
    
    return jsonify({'message': 'Employee added', 'employee_id': str(result.inserted_id)}), 201

# Route to update an existing employee
@routes_bp.route('/employees/<emp_id>', methods=['PUT'])
def update_employee(emp_id):
    data = request.json

    # Validate ObjectId
    if not ObjectId.is_valid(emp_id):
        return jsonify({'error': 'Invalid employee ID'}), 400

    # Find and update the employee in the database
    result = mongo.db.employees.update_one(
        {'_id': ObjectId(emp_id)},
        {'$set': data}
    )

    # Check if the employee was found and updated
    if result.matched_count == 0:
        return jsonify({'error': 'Employee not found'}), 404

    return jsonify({'message': 'Employee updated'})

# Route to delete an existing employee
@routes_bp.route('/employees/<emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    # Validate ObjectId
    if not ObjectId.is_valid(emp_id):
        return jsonify({'error': 'Invalid employee ID'}), 400

    # Find and delete the employee in the database
    result = mongo.db.employees.delete_one({'_id': ObjectId(emp_id)})

    # Check if the employee was found and deleted
    if result.deleted_count == 0:
        return jsonify({'error': 'Employee not found'}), 404

    return jsonify({'message': 'Employee deleted'})

# Register the routes blueprint
app.register_blueprint(routes_bp, url_prefix='/api')

if __name__ == '__main__':
    # Run the Flask application
    app.run(debug=True)
