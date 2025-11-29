import React from 'react';

const UserGraph = ({ data }) => {
  // Sample data structure: 
  // [{ month: 'Jan', users: 10 }, { month: 'Feb', users: 15 }, ...]
  
  const maxUsers = Math.max(...data.map(item => item.users));
  const barWidth = 40;
  const spacing = 20;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Users Per Month</h3>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        height: '200px',
        padding: '20px 0',
        borderBottom: '1px solid #eee'
      }}>
        {data.map((item) => (
          <div key={item.month} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            margin: `0 ${spacing / 2}px`
          }}>
            <div style={{
              width: `${barWidth}px`,
              height: `${(item.users / maxUsers) * 150}px`,
              backgroundColor: '#4f46e5',
              borderRadius: '4px 4px 0 0'
            }} />
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {item.users}
            </div>
            <div style={{ 
              marginTop: '4px', 
              fontSize: '12px',
              color: '#666'
            }}>
              {item.month}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserGraph;