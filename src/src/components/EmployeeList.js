import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

function EmployeeList() {
    // State variables
    const [employees, setEmployees] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filterSalary, setFilterSalary] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch employees when the component mounts
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Function to fetch employees from the API
    const fetchEmployees = async () => {
        setIsLoading(true); // Set loading state to true
        try {
            // Confirming the API endpoint
            const apiUrl = 'http://127.0.0.1:5000/api/employees';
            console.log('Fetching data from:', apiUrl);

            // API call to fetch employees
            const response = await axios.get(apiUrl);

            // Update employees state with fetched data
            if (response && response.data) {
                setEmployees(response.data);
                setFilteredEmployees(response.data);
                setError(null);
            } else {
                throw new Error('Invalid data format');
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            
            // Detailed error handling
            const errorMessage = err.response
                ? `Failed to fetch employees: ${err.response.status} - ${err.response.data}`
                : 'Failed to fetch employees. Please check your network connection.';
            
            setError(errorMessage);
        } finally {
            setIsLoading(false); // Set loading state to false when done
        }
    };

    // Handle filter changes
    const handleFilterNameChange = (e) => {
        setFilterName(e.target.value);
    };

    const handleFilterSalaryChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setFilterSalary(''); // Reset the filter if input is empty
        } else {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
                setFilterSalary(parsedValue); // Update filter salary if it's a valid number
            } else {
                setFilterSalary(''); // Reset the filter if the input is not a valid number
            }
        }
    };

    // Apply filters to the employees list
    const applyFilters = () => {
        const filtered = employees.filter((employee) => {
            const nameMatch = employee.name.toLowerCase().includes(filterName.toLowerCase());
            const salaryMatch = filterSalary === '' || employee.salary >= filterSalary;
            return nameMatch && salaryMatch;
        });

        setFilteredEmployees(filtered);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 shadow-lg w-full sm:max-w-lg lg:max-w-2xl">
                {/* Title */}
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Employee List</h2>

                {/* Filter inputs and apply button */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {/* Name filter input */}
                    <input
                        type="text"
                        className="border rounded p-2 w-full sm:w-1/2 lg:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Filter by name"
                        value={filterName}
                        onChange={handleFilterNameChange}
                    />
                    {/* Salary filter input */}
                    <input
                        type="number"
                        className="border rounded p-2 w-full sm:w-1/2 lg:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Filter by salary"
                        value={filterSalary}
                        onChange={handleFilterSalaryChange}
                    />
                    {/* Apply filters button */}
                    <button
                        className="bg-blue-600 text-white rounded p-2 w-full sm:w-1/4 lg:w-1/6 focus:outline-none hover:bg-blue-700 transition duration-200 ease-in-out"
                        onClick={applyFilters}
                    >
                        Apply Filters
                    </button>
                </div>

                {/* Display loading spinner when isLoading is true */}
                {isLoading && (
                    <div className="flex justify-center items-center mb-4">
                        <ClipLoader size={35} color={"#123abc"} />
                    </div>
                )}

                {/* Display error message if any */}
                {error && (
                    <div className="text-red-500 mb-4 p-4 border border-red-500 rounded">
                        {error}
                    </div>
                )}

                {/* Display filtered employees */}
                <ul className="space-y-4">
                    {filteredEmployees.map((employee) => (
                        <li key={employee._id} className="border rounded p-4 shadow-md">
                            <strong className="block">{employee.name}</strong>
                            <p>Position: {employee.position}</p>
                            <p>Salary: ${employee.salary.toFixed(2)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default EmployeeList;
