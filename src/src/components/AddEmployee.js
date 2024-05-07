import React, { useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function AddEmployee() {
    const [employee, setEmployee] = useState({
        name: '',
        position: '',
        salary: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prevEmployee) => ({
            ...prevEmployee,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Form validation
        if (!employee.name || !employee.position || isNaN(parseFloat(employee.salary)) || parseFloat(employee.salary) <= 0) {
            setError('Please provide valid inputs for all fields.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/employees', employee, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });

            if (response.status === 200) {
                // Reset form and clear errors on success
                setEmployee({ name: '', position: '', salary: '' });
                alert('Employee added successfully.');
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;
                setError(data.error || `API error: ${status}`);
            } else if (err.code === 'ECONNABORTED') {
                setError('Request timeout. The server took too long to respond.');
            } else if (err.request) {
                setError('No response from server. Check network connection.');
            } else {
                setError(`Request error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-20 shadow-lg max-w-md mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Add New Employee</h2>

                {/* Loading spinner */}
                {isLoading && (
                    <div className="flex justify-center items-center mb-4">
                        <ClipLoader size={35} color={"#123abc"} />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-800 font-semibold mb-2">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={employee.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="position" className="block text-gray-800 font-semibold mb-2">Position:</label>
                        <input
                            type="text"
                            id="position"
                            name="position"
                            value={employee.position}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="salary" className="block text-gray-800 font-semibold mb-2">Salary:</label>
                        <input
                            type="number"
                            id="salary"
                            name="salary"
                            value={employee.salary}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200 ease-in-out"
                        disabled={isLoading}
                    >
                        Add Employee
                    </button>
                </form>

                {/* Error message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
