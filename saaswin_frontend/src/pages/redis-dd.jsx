import React from 'react';
import RedisDdViewer from '../components/RedisDdViewer'; // Adjust the path if necessary

// Component name changed to follow conventions (PascalCase)
// but the file name determines the route
function RedisDdPage() {
    // You might keep the component name for clarity
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 50px)' }}>
            <h1 style={{ flexShrink: 0, marginBottom: '1rem' }}>Redis DD 데이터 조회</h1>
            <div style={{ flexGrow: 1 }}>
                <RedisDdViewer />
            </div>
        </div>
    );
}

// Default export remains the same component
export default RedisDdPage;
