import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Lazy load the components
const AddEmployee = lazy(() => import('./src/components/AddEmployee'));
const EmployeeList = lazy(() => import('./src/components/EmployeeList'));

function App() {
    return (
        <Router>
            <Routes>
                {/* Wrap the components in Suspense */}
                <Route
                    path="/"
                    element={
                        <Suspense fallback={<div>Loading AddEmployee...</div>}>
                            <AddEmployee />
                        </Suspense>
                    }
                />
                <Route
                    path="/list"
                    element={
                        <Suspense fallback={<div>Loading EmployeeList...</div>}>
                            <EmployeeList />
                        </Suspense>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
