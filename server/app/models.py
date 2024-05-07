from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from bson import ObjectId
from werkzeug.exceptions import HTTPException

class Employee:
    def __init__(self, name, position, salary, employee_id=None):
        # Initialize the Employee object
        self.name = name
        self.position = position
        self.salary = salary
        self.employee_id = employee_id

    def to_dict(self):
        # Convert Employee object to a dictionary
        data = {
            'name': self.name,
            'position': self.position,
            'salary': self.salary,
        }
        if self.employee_id:
            data['_id'] = str(self.employee_id)
        return data

    def save(self, mongo):
        # Save the Employee to the database
        if not self.employee_id:
            # If no employee_id, insert a new record
            result = mongo.db.employees.insert_one(self.to_dict())
            self.employee_id = result.inserted_id
        else:
            # Otherwise, update the existing record
            mongo.db.employees.update_one(
                {'_id': ObjectId(self.employee_id)},
                {'$set': self.to_dict()}
            )

    @classmethod
    def find_all(cls, mongo):
        # Find and return all employees
        employees = mongo.db.employees.find()
        return [cls(employee['name'], employee['position'], employee['salary'], employee['_id'])
                for employee in employees]

    @classmethod
    def find_by_id(cls, mongo, emp_id):
        # Find an employee by ID
        employee = mongo.db.employees.find_one({'_id': ObjectId(emp_id)})
        if employee:
            return cls(employee['name'], employee['position'], employee['salary'], employee['_id'])
        return None

    @classmethod
    def delete(cls, mongo, emp_id):
        # Delete an employee by ID
        mongo.db.employees.delete_one({'_id': ObjectId(emp_id)})

app = Flask(__name__)

# Configure PyMongo
app.config["MONGO_URI"] = "mongodb://localhost:27017/trials"
mongo = PyMongo(app)

# Enable CORS (if necessary)
from flask_cors import CORS
CORS(app)

@app.route('/api/employees', methods=['GET', 'POST'])
def employees():
    if request.method == 'GET':
        # Retrieve all employees
        employees = Employee.find_all(mongo)
        return jsonify([employee.to_dict() for employee in employees])
    elif request.method == 'POST':
        # Create a new employee
        data = request.get_json()
        employee = Employee(data['name'], data['position'], data['salary'])
        employee.save(mongo)
        return jsonify(employee.to_dict()), 201

@app.route('/api/employees/<string:emp_id>', methods=['GET', 'PUT', 'DELETE'])
def employee(emp_id):
    employee = Employee.find_by_id(mongo, emp_id)
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404

    if request.method == 'GET':
        # Return the employee's details
        return jsonify(employee.to_dict())
    elif request.method == 'PUT':
        # Update the employee
        data = request.get_json()
        employee.name = data.get('name', employee.name)
        employee.position = data.get('position', employee.position)
        employee.salary = data.get('salary', employee.salary)
        employee.save(mongo)
        return jsonify(employee.to_dict())
    elif request.method == 'DELETE':
        # Delete the employee
        Employee.delete(mongo, emp_id)
        return jsonify({'message': 'Employee deleted successfully'})

@app.errorhandler(Exception)
def handle_exception(e):
    # Handle any unhandled exceptions
    if isinstance(e, HTTPException):
        return jsonify(error=str(e)), e.code
    else:
        return jsonify(error="An unexpected error occurred."), 500

if __name__ == '__main__':
    app.run(debug=True)
